package vkrajn.taskmanager.model;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Helper to fill database with some predefined data. Implements
 * CommandLineRunner so that it is executed after all the beans are created and
 * registered.
 *
 * @author Vojtech Krajnansky
 * @version 14/07/2017
 */
@Component
public class DatabaseLoader implements CommandLineRunner {

    // Attributes
    private final TaskListRepo taskListRepo;
    private final TaskRepo taskRepo;

    // Constructors
    @Autowired
    public DatabaseLoader(TaskListRepo taskListRepo, TaskRepo taskRepo) {
        this.taskListRepo = taskListRepo;
        this.taskRepo = taskRepo;
    }

    // Override Methods
    @Override
    public void run(String... s) throws Exception {

        getTaskLists().forEach(taskList -> {
            TaskList tl = taskListRepo.save(taskList);

            List<Task> tasks = getTasks(4, tl);

            tasks.forEach(task -> {
                Task t = taskRepo.save(task);
            });
        });
    }

    // Helper Methods
    private List<TaskList> getTaskLists() {

        List<TaskList> taskLists = new ArrayList<>();

        Iterator<String> it1 = getTaskListNames().iterator();
        Iterator<String> it2 = getTaskListDescriptions().iterator();

        while (it1.hasNext() && it2.hasNext()) {
            TaskList tl = new TaskList(it1.next(), it2.next());

            taskLists.add(tl);
        }

        return taskLists;
    }

    private List<String> getTaskListNames() {
        List<String> listNames = new ArrayList<>();

        listNames.add("School Projects");
        listNames.add("Work Tasks");
        listNames.add("Home");

        return listNames;
    }

    private List<String> getTaskListDescriptions() {
        List<String> listDescriptions = new ArrayList<>();

        listDescriptions.add("projects for school");
        listDescriptions.add("work projects");
        listDescriptions.add("home stuff");

        return listDescriptions;
    }

    private List<Task> getTasks(int count, TaskList tl) {
        List<Task> tasks = new ArrayList<>();

        Iterator<String> it1 = getTaskNames(count).iterator();
        Iterator<String> it2 = getTaskDescriptions(count).iterator();

        while (it1.hasNext() && it2.hasNext()) {
            Task task = new Task(it1.next(), it2.next(), tl);

            tasks.add(task);
        }

        return tasks;
    }

    private List<String> getTaskNames(int count) {
        List<String> taskNames = new ArrayList<>();

        for (int i = 1; i <= count; i++) {
            taskNames.add("Task " + i);
        }

        return taskNames;
    }

    private List<String> getTaskDescriptions(int count) {
        List<String> taskDescriptions = new ArrayList<>();

        for (int i = 1; i <= count; i++) {
            taskDescriptions.add("description: " + i);
        }

        return taskDescriptions;
    }
}
