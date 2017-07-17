package vkrajn.taskmanager.model;

import org.springframework.data.rest.core.config.Projection;

/**
 * A {@link Projection} for {@link TaskList} for easier access to TaskList id,
 * name, and description when rendering.
 *
 * @author Vojtech Krajnansky
 * @version 07/15/2017
 */
@Projection(name = "inline", types = {TaskList.class})
public interface InlineTaskListProjection {

    Long getId();

    String getName();

    String getDescription();
}
