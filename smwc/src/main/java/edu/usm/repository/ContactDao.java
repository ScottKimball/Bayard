package edu.usm.repository;

import edu.usm.domain.Contact;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.HashSet;

/**
 * Created by scottkimball on 2/22/15.
 */

@Repository
public interface ContactDao extends CrudRepository<Contact, String> {

    @Override
    HashSet<Contact> findAll();

    @Query("select c from contact as c where initiator = 'true'")
    HashSet<Contact> findAllInitiators();
}
