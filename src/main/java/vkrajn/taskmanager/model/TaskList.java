package vkrajn.taskmanager.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import lombok.Data;

/**
 * Model class to represent a category of tasks.
 *
 * @author Vojtech Krajnansky
 * @version 07/14/2017
 */
@Data   // autogenerate getters, setters, toString, etc.
@Entity
public class TaskList {

    // Attributes
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private String description;

    // Constructors
    public TaskList() {
    }

    public TaskList(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
