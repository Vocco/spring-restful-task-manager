'use strict';

// Constants
const React = require('react');
const ReactDOM = require('react-dom');
const when = require('when');
const client = require('./client');
const follow = require('./follow');
const stompClient = require('./websocket-listener');
const root = '/api';

/**
 * Top level container for all components.
 */
class Home extends React.Component {

	constructor(props) {
		super(props);
		this.state = {taskLists: [], attributes: [], links: {}};
		this.onCreate = this.onCreate.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.refreshTaskListsPage = this.refreshTaskListsPage.bind(this);
	}

	componentDidMount() {
		this.loadFromServer();
		stompClient.register([
			{route: '/topic/newTaskList', callback: this.refreshTaskListsPage},
			{route: '/topic/updateTaskList', callback: this.refreshTaskListsPage},
			{route: '/topic/deleteTaskList', callback: this.refreshTaskListsPage}
		]);
	}

	render() {
		return (
			<div>
				<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
				<TaskListList taskLists={this.state.taskLists}
							  links={this.state.links}
							  attributes={this.state.attributes}
							  onUpdate={this.onUpdate}
                              onDelete={this.onDelete} />
			</div>
		)
	}
    
    // Helper functions
    loadFromServer() {
    	follow(client, root, [
    		{rel: 'taskLists'}]
    	).then(taskListCollection => {
    		return client({
    			method: 'GET',
    			path: taskListCollection.entity._links.profile.href,
    			headers: {'Accept': 'application/schema+json'}
    		}).then(schema => {
    			this.schema = schema.entity;
                this.links = taskListCollection.entity._links;
    			return taskListCollection;
    		});
    	}).then(taskListCollection => {
    		return taskListCollection.entity._embedded.taskLists.map(taskList =>
    				client({
    					method: 'GET',
    					path: taskList._links.self.href
    				})
    		);
    	}).then(taskListPromises => {
            return when.all(taskListPromises);
        }).then(taskLists => {
    		this.setState({
    			taskLists: taskLists,
    			attributes: Object.keys(this.schema.properties),
    			links: this.links
            });
    	});
    }
    
    // Callbacks	
	onCreate(newTaskList) {
		follow(client, root, ['taskLists']).then(response => {
			client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newTaskList,
				headers: {'Content-Type': 'application/json'}
			})
		})
	}
    
	onUpdate(taskList, updatedTaskList) {
		client({
			method: 'PUT',
			path: taskList.entity._links.self.href,
			entity: updatedTaskList,
			headers: {'Content-Type': 'application/json',}
		});
	}
    
    onDelete(taskList) {
        client({
			method: 'DELETE',
			path: taskList.entity._links.self.href
		});
    }
	
	refreshTaskListsPage(message) {
		follow(client, root, [{
			rel: 'taskLists'
		}]).then(taskListCollection => {
			this.links = taskListCollection.entity._links;
	
			return taskListCollection.entity._embedded.taskLists.map(taskList => {
				return client({
					method: 'GET',
					path: taskList._links.self.href
				})
			});
		}).then(taskListPromises => {
			return when.all(taskListPromises);
		}).then(taskLists => {
			this.setState({
				taskLists: taskLists,
				attributes: Object.keys(this.schema.properties),
				links: this.links
			});
		});
	}
}

/**
 * Container for table of TaskLists
 */
class TaskListList extends React.Component{
	
	render() {
        var taskLists = this.props.taskLists.map(taskList =>
				<TaskList key={taskList.entity._links.self.href}
						  taskList={taskList}
						  attributes={this.props.attributes}
						  onUpdate={this.props.onUpdate}
						  onDelete={this.props.onDelete}/>
		);
        
		return (
			<table>
				<tbody>
					<tr>
						<th>Task List</th>
						<th>Description</th>
					</tr>
					{taskLists}
				</tbody>
			</table>
		)
	}
}

/**
 * Container for a single TaskList
 */
class TaskList extends React.Component{
	
    constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}
    
    handleDelete() {
		this.props.onDelete(this.props.taskList);
	}
    
    render() {
		var split = this.props.taskList.entity._links.self.href.split("/");
		var tlid = split[split.length - 1];
		var tlrequest = "/tasklistrequest?tlid=" + tlid;
		return (
			<tr>
				<td><a href={tlrequest}>{this.props.taskList.entity.name}</a></td>
				<td>{this.props.taskList.entity.description}</td>
                <td>
					<UpdateDialog taskList={this.props.taskList}
								  attributes={this.props.attributes}
								  onUpdate={this.props.onUpdate}/>
				</td>
                <td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}

/**
 * Container for a dialog window to create a new TaskList
 */
class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var newTaskList = {};
		this.props.attributes.forEach(attribute => {
			newTaskList[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newTaskList);

		// clear out the dialog's inputs
		this.props.attributes.forEach(attribute => {
			ReactDOM.findDOMNode(this.refs[attribute]).value = '';
		});

		// Navigate away from the dialog to hide it.
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map(attribute =>
			<p key={attribute}>
				<input type="text" placeholder={attribute} ref={attribute} className="field" />
			</p>
		);

		return (
			<div>
				<a href="#createTaskList">Create</a>

				<div id="createTaskList" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new task list</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

/**
 * Container for a dialog window to update an existing TaskList
 */
class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var updatedTaskList = {};
		this.props.attributes.forEach(attribute => {
			updatedTaskList[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.taskList, updatedTaskList);
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map((...args) =>
				<p key={this.props.taskList.entity[args[0]].concat(args[1].toString())}>
					<input type="text" placeholder={args[0]}
						   defaultValue={this.props.taskList.entity[args[0]]}
						   ref={args[0]} className="field" />
				</p>
		);

		var dialogId = "updateTaskList-" + this.props.taskList.entity._links.self.href;

		return (
			<div key={this.props.taskList.entity._links.self.href}>
				<a href={"#" + dialogId}>Update</a>
				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update a task list</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Update</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

};

ReactDOM.render(
	<Home />,
	document.getElementById('home')
)