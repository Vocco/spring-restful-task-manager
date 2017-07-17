package vkrajn.taskmanager.events;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import static vkrajn.taskmanager.events.WebSocketConfiguration.MESSAGE_PREFIX;
import vkrajn.taskmanager.model.TaskList;

/**
 * Event handler to trap events based on {@link TaskList}s.
 *
 * @author Vojtech Krajnansky
 * @version 07/14/2017
 */
@Component
@RepositoryEventHandler(TaskList.class)
public class TaskListEventHandler {

    // Attributes
    private final SimpMessagingTemplate websocket;
    private final EntityLinks links;

    // Constructors
    @Autowired
    public TaskListEventHandler(SimpMessagingTemplate websocket, EntityLinks links) {
        this.websocket = websocket;
        this.links = links;
    }

    // Websocket Handler Methods
    @HandleAfterCreate
    public void newTaskList(TaskList tl) {
        websocket.convertAndSend(
                MESSAGE_PREFIX + "/newTaskList", getPath(tl));
    }

    @HandleAfterDelete
    public void deleteTaskList(TaskList tl) {
        websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteTaskList", getPath(tl));
    }

    @HandleAfterSave
    public void updateTaskList(TaskList tl) {
        websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateTaskList", getPath(tl));
    }

    // Helper Methods
    /**
     * Take a {@link TaskList} and get the URI using Spring Data REST's
     * {@link EntityLinks}.
     *
     * @param tl {@link TaskList} for which to get the URI
     */
    private String getPath(TaskList tl) {
        return links.linkForSingleResource(tl.getClass(),
                tl.getId()).toUri().getPath();
    }
}
