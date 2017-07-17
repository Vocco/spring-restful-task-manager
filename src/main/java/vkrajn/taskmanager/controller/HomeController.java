package vkrajn.taskmanager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Spring MVC controller for the home page.
 *
 * @author Vojtech Krajnansky
 * @version 14/07/2017
 */
@Controller
public class HomeController {

    /**
     * Maps to 'src/main/resources/templates/index.html'.
     *
     * @return 'index'
     */
    @RequestMapping(value = "/")
    public String index() {
        return "index";
    }

}
