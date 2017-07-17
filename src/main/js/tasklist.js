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
class TaskListTop extends React.Component {

	constructor(props) {
		super(props);
		this.state = {taskList: [], tasks: [], attributes: [], links: {}};
		this.onCreate = this.onCreate.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.refreshTasksPage = this.refreshTasksPage.bind(this);
	}

	componentDidMount() {
		this.loadFromServer();
		
		stompClient.register([
			{route: '/topic/newTask', callback: this.refreshTasksPage},
			{route: '/topic/updateTask', callback: this.refreshTasksPage},
			{route: '/topic/deleteTask', callback: this.refreshTasksPage}
		]);
	}

	render() {
		return (
			<div>
				<a href="/">Back</a>
				<CreateDialog taskList={this.state.taskList} attributes={this.state.attributes} onCreate={this.onCreate}/>
				<TaskList tasks={this.state.tasks}
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
    		{rel: 'tasks'}]
    	).then(taskCollection => {
    		return client({
    			method: 'GET',
    			path: taskCollection.entity._links.profile.href,
    			headers: {'Accept': 'application/schema+json'}
    		}).then(schema => {
    			/**
				 * Filter unneeded JSON Schema properties, like uri references and
				 * subtypes ($ref).
				 */
				Object.keys(schema.entity.properties).forEach(function (property) {
					if (property !== 'taskList') {
							
					}
					if (schema.entity.properties[property].hasOwnProperty('format') &&
						schema.entity.properties[property].format === 'uri') {
						delete schema.entity.properties[property];
					}
					else if (schema.entity.properties[property].hasOwnProperty('$ref')) {
						delete schema.entity.properties[property];
					}
					
				});

				this.schema = schema.entity;
				this.links = taskCollection.entity._links;
				return taskCollection;
    		});
    	}).then(taskCollection => {
    		return taskCollection.entity._embedded.tasks.filter(task => {
					return task._embedded.taskList.id == document.getElementById('data_id')
						.getAttribute('data-tl_id');
				}).map(task =>
    				client({
    					method: 'GET',
    					path: task._links.self.href
    				})
    		);
    	}).then(taskPromises => {
            return when.all(taskPromises);
        })
		.then(tasks => {
    		this.setState({
    			tasks: tasks,
    			attributes: Object.keys(this.schema.properties),
    			links: this.links
            });
    	});
		
		follow(client, root, [
    		{rel: 'taskLists'}]
    	).then(taskListCollection => {
    		return client({
    			method: 'GET',
    			path: taskListCollection.entity._links.profile.href,
    			headers: {'Accept': 'application/schema+json'}
    		}).then(schema => {
				Object.keys(schema.entity.properties).forEach(function (property) {
					if (schema.entity.properties[property].hasOwnProperty('format') &&
						schema.entity.properties[property].format === 'uri') {
						delete schema.entity.properties[property];
					}
					else if (schema.entity.properties[property].hasOwnProperty('$ref')) {
						delete schema.entity.properties[property];
					}
				});
				
    			this.schema = schema.entity;
                this.links = taskListCollection.entity._links;
    			return taskListCollection;
    		});
    	}).then(taskListCollection => {
    		return taskListCollection.entity._embedded.taskLists.filter(taskList => {
					return taskList.id == document.getElementById('data_id')
						.getAttribute('data-tl_id');
				}).map(taskList =>
    				client({
    					method: 'GET',
    					path: taskList._links.self.href
    				})
    		);
    	}).then(taskListPromises => {
            return when.all(taskListPromises);
        }).then(taskList => {
    		this.setState({
    			taskList: taskList,
            });
    	});
    }
    
    // Callbacks	
	onCreate(newTask) {
		follow(client, root, ['tasks']).then(response => {
			client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newTask,
				headers: {'Content-Type': 'application/json'}
			})
		})
	}
    
	onUpdate(task, updatedTask) {
		client({
			method: 'PUT',
			path: task.entity._links.self.href,
			entity: updatedTask,
			headers: {'Content-Type': 'application/json',}
		});
	}
    
    onDelete(task) {
        client({
			method: 'DELETE',
			path: task.entity._links.self.href
		});
    }
	
	refreshTasksPage(message) {
		follow(client, root, [{
			rel: 'tasks'
		}]).then(taskCollection => {
			this.links = taskCollection.entity._links;
	
			return taskCollection.entity._embedded.tasks.filter(task => {
					return task._embedded.taskList.id == document.getElementById('data_id')
						.getAttribute('data-tl_id');
				}).map(task => {
				return client({
					method: 'GET',
					path: task._links.self.href
				})
			});
		}).then(taskPromises => {
			return when.all(taskPromises);
		}).then(tasks => {
			this.setState({
				tasks: tasks,
				attributes: Object.keys(this.schema.properties),
				links: this.links
			});
		});
	}
}

/**
 * Container for table of Tasks
 */
class TaskList extends React.Component{
	
	render() {
		
		var tasks = this.props.tasks.map(task =>
				<Task key={task.entity._links.self.href}
						  task={task}
						  attributes={this.props.attributes}
						  onUpdate={this.props.onUpdate}
						  onDelete={this.props.onDelete}/>
		);
        
		return (
			<table>
				<tbody>
					<tr>
						<th>Task</th>
						<th>Description</th>
					</tr>
					{tasks}
				</tbody>
			</table>
		)
	}
}

/**
 * Container for a single Task
 */
class Task extends React.Component{
	
    constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}
    
    handleDelete() {
		this.props.onDelete(this.props.task);
	}
    
    render() {
		return (
			<tr>
				<td>{this.props.task.entity.name}</td>
				<td>{this.props.task.entity.description}</td>
                <td>
					<UpdateDialog task={this.props.task}
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
 * Container for a dialog window to create a new Task
 */
class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var newTask = {};
		
		newTask.taskList = this.props.taskList[0].entity._links.self.href;
		
		this.props.attributes.forEach(attribute => {
			newTask[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		
		this.props.onCreate(newTask);

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
				<a href="#createTask">Create</a>

				<div id="createTask" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new task</h2>

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
 * Container for a dialog window to update an existing Task
 */
class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var updatedTask = {};
		this.props.attributes.forEach(attribute => {
			updatedTask[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.task, updatedTask);
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map((...args) =>
				<p key={this.props.task.entity[args[0]].concat(args[1].toString())}>
					<input type="text" placeholder={args[0]}
						   defaultValue={this.props.task.entity[args[0]]}
						   ref={args[0]} className="field" />
				</p>
		);

		var dialogId = "updateTask-" + this.props.task.entity._links.self.href;

		return (
			<div key={this.props.task.entity._links.self.href}>
				<a href={"#" + dialogId}>Update</a>
				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update a task</h2>

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
	<TaskListTop />,
	document.getElementById('tasklist')
)