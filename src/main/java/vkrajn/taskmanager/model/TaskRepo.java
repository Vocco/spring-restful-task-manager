package vkrajn.taskmanager.model;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * A {@link PagingAndSortingRepository} for {@link Task}s.
 * 
 * @author Vojtech Krajnansky
 * @version 07/16/2017
 */
public interface TaskRepo extends PagingAndSortingRepository<Task, Long> {
    Task findByName(String name);
}

