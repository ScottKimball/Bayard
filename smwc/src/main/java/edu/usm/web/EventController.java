package edu.usm.web;

import com.fasterxml.jackson.annotation.JsonView;
import edu.usm.domain.Committee;
import edu.usm.domain.Event;
import edu.usm.domain.Views;
import edu.usm.dto.EventDto;
import edu.usm.dto.IdDto;
import edu.usm.dto.Response;
import edu.usm.service.CommitteeService;
import edu.usm.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

/**
 * Created by Andrew on 5/30/2015.
 */
@RestController
@RequestMapping("/events")
public class EventController {

    @Autowired
    EventService eventService;

    @Autowired
    CommitteeService committeeService;

    @RequestMapping(method = RequestMethod.GET, produces = "application/json")
    @ResponseStatus(HttpStatus.OK)
    @JsonView({Views.EventList.class})
    public Set<Event> getAllEvents() {
        return eventService.findAll();
    }

    @RequestMapping(method = RequestMethod.POST, consumes = "application/json")
    @ResponseStatus(HttpStatus.CREATED)
    public Response createEvent(@RequestBody EventDto eventDto) {
        Committee committee = null;
        if (null != eventDto.getCommitteeId()) {
            committee = committeeService.findById(eventDto.getCommitteeId());
        }

        try {
            String eventId = eventService.create(eventDto, committee);
            return new Response(eventId,Response.SUCCESS,null);
        } catch (Exception e) {
            return new Response(null, Response.FAILURE, "Unable to create event");
        }

    }

    @ResponseStatus(HttpStatus.OK)
    @RequestMapping(method = RequestMethod.GET, value = "/{id}", produces={"application/json"})
    @JsonView({Views.EventList.class})
    public Event getEventById(@PathVariable("id") String id) {
        return eventService.findById(id);
    }

}
