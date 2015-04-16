package edu.usm.it.service.impl;

import com.google.common.collect.Lists;
import edu.usm.domain.Committee;
import edu.usm.domain.Contact;
import edu.usm.it.service.BasicService;
import edu.usm.it.service.CommitteeService;
import edu.usm.repository.CommitteeDao;
import edu.usm.repository.ContactDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by scottkimball on 4/15/15.
 */

@Service
public class CommitteeServiceImpl extends BasicService implements CommitteeService {

    @Autowired
    private CommitteeDao committeeDao;

    @Autowired
    private ContactDao contactDao;

    private Logger logger = LoggerFactory.getLogger(CommitteeServiceImpl.class);

    @Override
    public Committee findById(String id) {
        logger.debug("Finding committee with ID: " + id);
        return committeeDao.findOne(id);
    }

    @Override
    public List<Committee> findAll() {
        logger.debug("Finding all Committees");
        return Lists.newArrayList(committeeDao.findAll());
    }

    @Override
    public void delete(Committee committee) {
        logger.debug("Deleting committe with ID: " + committee.getId());
        updateLastModified(committee);
        if (committee.getMembers() != null) {
            for(Contact contact : committee.getMembers()) {
                contact.getCommittees().remove(committee);
                contactDao.save(contact);
            }
        }
        committeeDao.delete(committee);
    }

    @Override
    public void update(Committee committee) {
        logger.debug("Updating Committee with ID: " + committee.getId());
        updateLastModified(committee);
        committeeDao.save(committee);
    }

    @Override
    public void create(Committee committee) {
        logger.debug("Creating committee with ID: " + committee.getId());
        committeeDao.save(committee);
    }

    @Override
    public void deleteAll() {
        List<Committee> committees = findAll();
        committees.stream().forEach(this::delete);
    }
}
