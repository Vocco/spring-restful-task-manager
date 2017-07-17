package vkrajn.taskmanager.model;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * A {@link CrudRepository} for {@link TaskList}s.
 *
 * @author Vojtech Krajnansky
 * @version 07/14/2017
 */
@RepositoryRestResource(collectionResourceRel = "taskLists", path = "taskLists",
        excerptProjection = InlineTaskListProjection.class)
public interface TaskListRepo extends CrudRepository<TaskList, Long> {

    TaskList findById(Long id);
}
