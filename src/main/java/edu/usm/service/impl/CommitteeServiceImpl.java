package edu.usm.service.impl;

import edu.usm.domain.Committee;
import edu.usm.domain.Contact;
import edu.usm.domain.Event;
import edu.usm.domain.exception.ConstraintMessage;
import edu.usm.domain.exception.ConstraintViolation;
import edu.usm.domain.exception.NullDomainReference;
import edu.usm.repository.CommitteeDao;
import edu.usm.service.BasicService;
import edu.usm.service.CommitteeService;
import edu.usm.service.ContactService;
import edu.usm.service.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by scottkimball on 4/15/15.
 */

@Service
public class CommitteeServiceImpl extends BasicService implements CommitteeService {

    @Autowired
    private CommitteeDao committeeDao;

    @Autowired
    private ContactService contactService;

    @Autowired
    private EventService eventService;

    private Logger logger = LoggerFactory.getLogger(CommitteeServiceImpl.class);

    @Override
    public Committee findById(String id) {
        if (null == id) {
            return null;
        }
        return committeeDao.findOne(id);
    }

    @Override
    public Set<Committee> findAll() {
        logger.debug("Finding all Committees");
        return (Set<Committee>) committeeDao.findAll();
    }

    @Override
    public Committee findByName(String name) {
        return committeeDao.findByName(name);
    }

    private void validateFields(Committee committee) throws NullDomainReference, ConstraintViolation{
        if (null == committee) {
            throw new NullDomainReference.NullCommittee();
        } else if (null == committee.getName()) {
            throw new ConstraintViolation(ConstraintMessage.COMMITTEE_REQUIRED_NAME);
        }
        validateUniqueness(committee);
    }

    private void validateUniqueness(Committee committee) throws ConstraintViolation {
        Committee existingName = findByName(committee.getName());
        if (null != existingName && !existingName.getId().equalsIgnoreCase(committee.getId())) {
            throw new ConstraintViolation(ConstraintMessage.COMMITTEE_NON_UNIQUE);
        }
    }

    @Override
    public void delete(Committee committee) throws NullDomainReference, ConstraintViolation {

        if (null == committee) {
            throw new NullDomainReference.NullCommittee();
        }

        logger.debug("Deleting committe with ID: " + committee.getId());
        updateLastModified(committee);
        if (committee.getMembers() != null) {
            Set<Contact> members = new HashSet<>(committee.getMembers());
            for(Contact contact : members) {
                contactService.removeContactFromCommittee(contact,committee);
            }
        }

        if (committee.getEvents() != null) {
            Set<Event> events = new HashSet<>(committee.getEvents());
            for (Event event : events) {
                event.setCommittee(null);
                eventService.update(event);
                committee.getEvents().remove(event);
            }

        }
        committeeDao.delete(committee);

    }

    @Override
    public void update(Committee committee) throws NullDomainReference, ConstraintViolation{

        validateFields(committee);

        updateLastModified(committee);
        committeeDao.save(committee);
    }

    @Override
    public String create(Committee committee) throws ConstraintViolation {

        if (null == committee.getName()) {
            throw new ConstraintViolation(ConstraintMessage.COMMITTEE_REQUIRED_NAME);
        }

        validateUniqueness(committee);

        committeeDao.save(committee);
        return committee.getId();
    }

    private void uncheckedDelete(Committee c) {
        try {
            delete(c);
        } catch (NullDomainReference e) {
            throw new RuntimeException(e);
        } catch (ConstraintViolation e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void deleteAll() {
        Set<Committee> committees = findAll();
        committees.stream().forEach(this::uncheckedDelete);
    }
}
