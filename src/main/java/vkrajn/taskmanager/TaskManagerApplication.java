package vkrajn.taskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring application class, launching point for the application.
 *
 * @author Vojtech Krajnansky
 * @version 07/14/2017
 */
@SpringBootApplication
public class TaskManagerApplication {

    /**
     * Application main method.
     *
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(TaskManagerApplication.class, args);
    }
}
