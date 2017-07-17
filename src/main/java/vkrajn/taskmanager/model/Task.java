package vkrajn.taskmanager.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Model class to represent a task.
 *
 * @author Vojtech Krajnansky
 * @version 07/14/2017
 */
@Data   // autogenerate getters, setters, toString, etc.
@Entity
public class Task {

    // Attributes
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private String description;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    private TaskList taskList;

    // Constructors
    private Task() {
    }

    public Task(String name, String description, TaskList taskList) {
        this.name = name;
        this.description = description;
        this.taskList = taskList;
    }
}
