package vkrajn.taskmanager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import vkrajn.taskmanager.model.TaskList;
import vkrajn.taskmanager.model.TaskListRepo;

/**
 * Spring MVC controller for a task list page.
 *
 * @author Vojtech Krajnansky
 * @version 15/07/2017
 */
@Controller
public class TaskListController {

    private TaskListRepo repository;

    @Autowired
    public TaskListController(TaskListRepo repository) {
        this.repository = repository;
    }

    /**
     * Maps to 'src/main/resources/templates/tasklist.html'.
     *
     * @param tlid Request parameter - ID of the {@link TaskList} requested
     * @param model A {@link Model} of the page
     * @return "tasklist"
     */
    @RequestMapping(value = "/tasklistrequest")
    public String tasklist(@RequestParam(value = "tlid", required = true)
            Long tlid, Model model) {
        TaskList tl = repository.findById(tlid);

        model.addAttribute("id", tlid);
        model.addAttribute("PageTitle", tl.getName());
        
        return "tasklist";
    }

}
