package edu.usm.service.impl;

import edu.usm.domain.*;
import edu.usm.dto.EncounterDto;
import edu.usm.repository.ContactDao;
import edu.usm.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by scottkimball on 3/12/15.
 */
@Service
public class ContactServiceImpl extends BasicService implements ContactService {

    @Autowired
    private ContactDao contactDao;
    @Autowired
    private OrganizationService organizationService;
    @Autowired
    private CommitteeService committeeService;
    @Autowired
    private EventService eventService;

    private Logger logger = LoggerFactory.getLogger(ContactServiceImpl.class);

    @Override
    public void attendEvent(Contact contact, Event event) {
        Set<Event> attendedEvents = contact.getAttendedEvents();
        Set<Contact> attendees = event.getAttendees();

        if (null == attendedEvents) {
            attendedEvents = new HashSet<>();
            contact.setAttendedEvents(attendedEvents);
        }

        if (null == attendees) {
            attendees = new HashSet<>();
            event.setAttendees(attendees);
        }

        attendees.add(contact);
        attendedEvents.add(event);
        update(contact);
    }



    @Override
    public Contact findById(String id) {
        logger.debug("Finding contact with ID: " + id);
        return contactDao.findOne(id);
    }

    @Override
    public Set<Contact> findAll() {
        logger.debug("Finding all Contacts");
        return (Set<Contact>) contactDao.findAll();
    }

    @Override
    public void delete(Contact contact) {
        logger.debug("Deleting contact " + contact.getId() );
        logger.debug("Time: " + LocalDateTime.now());

        updateLastModified(contact);

        /*Remove from organizations */
        if (contact.getOrganizations() != null) {
            for(Organization organization : contact.getOrganizations()) {
                organization.getMembers().remove(contact);
                organizationService.update(organization);
            }
        }

        /*Remove from committees*/
        if (contact.getCommittees() != null) {
            for(Committee committee : contact.getCommittees()) {
                committee.getMembers().remove(contact);
                committeeService.update(committee);
            }
        }

         /*Remove from attended events*/
        if (contact.getAttendedEvents() != null) {
            for(Event event : contact.getAttendedEvents()) {
                event.getAttendees().remove(contact);
                eventService.update(event);
            }
        }

        if (contact.getEncountersInitiated() != null) {
            for (Encounter encounter : contact.getEncountersInitiated()) {
                encounter.setInitiator(null);
                this.update(encounter.getContact());
            }
        }

        contactDao.delete(contact);
    }

    private void update(Contact contact) {
        logger.debug("Updating contact with ID: " + contact.getId());
        logger.debug("Time: " + LocalDateTime.now());
        updateLastModified(contact);
        contactDao.save(contact);
    }



    @Override
    public String create(Contact contact) {
        logger.debug("Creating contact with ID: " + contact.getId());
        logger.debug("Time: " + LocalDateTime.now());
        contactDao.save(contact);
        return contact.getId();
    }

    @Override
    public void deleteAll() {

        logger.debug("Deleting all contacts.");
        Set<Contact> contacts = findAll();
        contacts.stream().forEach(this::delete);
    }

    @Override
    public Set<Contact> findAllInitiators() {
        logger.debug("Getting all Initiators");
        return contactDao.findAllInitiators();
    }

    @Override
    public void addContactToOrganization(Contact contact, Organization organization) {
        Set<Organization> organizations = contact.getOrganizations();
        Set<Contact> members = organization.getMembers();

        if (organizations == null) {
            organizations = new HashSet<>();
            contact.setOrganizations(organizations);
        }

        if (members == null) {
            members = new HashSet<>();
            organization.setMembers(members);
        }

        members.add(contact);
        organizations.add(organization);
        update(contact);
    }


    @Override
    public void removeContactFromOrganization(Contact contact, Organization organization) {
        Set<Organization> organizations = contact.getOrganizations();
        Set<Contact> members = organization.getMembers();

        if (organizations == null || members == null) {
            return;
        }

        members.remove(contact);
        organizations.remove(organization);
        update(contact);
    }


    @Override
    public void addContactToCommittee(Contact contact, Committee committee) {
        Set<Committee> committees = contact.getCommittees();
        Set<Contact> members = committee.getMembers();

        if (committees == null) {
            committees = new HashSet<>();
            contact.setCommittees(committees);
        }

        if (members == null) {
            members = new HashSet<>();
            committee.setMembers(members);
        }

        members.add(contact);
        committees.add(committee);
        update(contact);
    }

    @Override
    public void removeContactFromCommittee(Contact contact, Committee committee) {
        Set<Committee> committees = contact.getCommittees();
        Set<Contact> members = committee.getMembers();

        if (committees == null || members == null) {
            return;
        }

        members.remove(contact);
        committees.remove(committee);
        update(contact);
    }

    @Override
    public void updateBasicDetails(Contact contact, Contact details) {
        contact.setFirstName(details.getFirstName());
        contact.setMiddleName(details.getMiddleName());
        contact.setLastName(details.getLastName());
        contact.setStreetAddress(details.getStreetAddress());
        contact.setAptNumber(details.getAptNumber());
        contact.setCity(details.getCity());
        contact.setZipCode(details.getZipCode());
        contact.setPhoneNumber1(details.getPhoneNumber1());
        contact.setPhoneNumber2(details.getPhoneNumber2());
        contact.setEmail(details.getEmail());
        contact.setLanguage(details.getLanguage());
        contact.setOccupation(details.getOccupation());
        contact.setInterests(details.getInterests());
        contact.setInitiator(details.isInitiator());

        update(contact);

    }

    @Override
    public void unattendEvent(Contact contact, Event event) {
        if (contact.getAttendedEvents() != null) {
            contact.getAttendedEvents().remove(event);
            event.getAttendees().remove(contact);
            update(contact);
            eventService.update(event);
        }
    }

    @Override
    public void updateDemographicDetails(Contact contact, Contact details) {

        contact.setRace(details.getRace());
        contact.setEthnicity(details.getEthnicity());
        contact.setDateOfBirth(details.getDateOfBirth());
        contact.setGender(details.getGender());
        contact.setDisabled(details.isDisabled());
        contact.setIncomeBracket(details.getIncomeBracket());
        contact.setSexualOrientation(details.getSexualOrientation());

        update(contact);
    }

    @Override
    public void addEncounter(Contact contact, Contact initiator, EncounterDto dto) {

        Encounter encounter = new Encounter();
        encounter.setEncounterDate(dto.getDate());
        encounter.setContact(contact);
        encounter.setInitiator(initiator);
        encounter.setNotes(dto.getNotes());
        encounter.setType(dto.getType());
        encounter.setAssessment(dto.getAssessment());

        if (null == contact.getEncounters()) {
            contact.setEncounters(new ArrayList<>());
        }

        contact.getEncounters().add(encounter);

        /*Sets assessment to most recent encounter assessment */
        Collections.sort(contact.getEncounters());
        int currentAssessment = contact.getEncounters().get(0).getAssessment() == Encounter.DEFAULT_ASSESSMENT ? contact.getAssessment() :
                contact.getEncounters().get(0).getAssessment();
        contact.setAssessment(currentAssessment);

        update(contact);
    }
}
