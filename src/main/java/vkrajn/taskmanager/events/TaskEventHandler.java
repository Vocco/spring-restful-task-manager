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
import vkrajn.taskmanager.model.Task;

/**
 * Event handler to trap events based on {@link Task}s.
 *
 * @author Vojtech Krajnansky
 * @version 07/16/2017
 */
@Component
@RepositoryEventHandler(Task.class)
public class TaskEventHandler {

    // Attributes
    private final SimpMessagingTemplate websocket;
    private final EntityLinks links;

    // Constructors
    @Autowired
    public TaskEventHandler(SimpMessagingTemplate websocket, EntityLinks links) {
        this.websocket = websocket;
        this.links = links;
    }

    // Websocket Handler Methods
    @HandleAfterCreate
    public void newTask(Task task) {
        websocket.convertAndSend(
                MESSAGE_PREFIX + "/newTask", getPath(task));
    }

    @HandleAfterDelete
    public void deleteTask(Task task) {
        websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteTask", getPath(task));
    }

    @HandleAfterSave
    public void updateTask(Task task) {
        websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateTask", getPath(task));
    }

    // Helper Methods
    /**
     * Take a {@link Task} and get the URI using Spring Data REST's
     * {@link EntityLinks}.
     *
     * @param task {@link Task} for which to get the URI
     */
    private String getPath(Task task) {
        return links.linkForSingleResource(task.getClass(),
                task.getId()).toUri().getPath();
    }
}
