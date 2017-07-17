package vkrajn.taskmanager.events;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

/**
 * Configuration for WebSocket support.
 *
 * @author Vojtech Krajnansky
 * @version 07/14/2017
 */
@Component
@EnableWebSocketMessageBroker
public class WebSocketConfiguration extends AbstractWebSocketMessageBrokerConfigurer {

    // Constants
    public static final String MESSAGE_PREFIX = "/topic";

    //Override Methods
    @Override
    public void registerStompEndpoints(StompEndpointRegistry reg) {
        reg.addEndpoint("/taskmanager").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry reg) {
        reg.enableSimpleBroker(MESSAGE_PREFIX);
        reg.setApplicationDestinationPrefixes("/app");
    }
}
