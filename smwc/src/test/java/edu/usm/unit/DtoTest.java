package edu.usm.unit;

import org.junit.Test;


/**
 * Created by scottkimball on 5/9/15.
 */


public class DtoTest {

    @Test
    public void testConvertToContact () throws Exception {

         /*basic fields
        ContactDto contactDto = new ContactDto();
        contactDto.setFirstName("firstName");
        contactDto.setMiddleName("middleName");
        contactDto.setLastName("lastName");
        contactDto.setStreetAddress("address");
        contactDto.setAptNumber("apt");
        contactDto.setCity("city");
        contactDto.setZipCode("zipcode");
        contactDto.setLanguage("language");
        contactDto.setEmail("email");
        contactDto.setPhoneNumber1("phone1");
        contactDto.setPhoneNumber2("phone2");
        contactDto.setId("id");
        contactDto.setAssessment(0);
        contactDto.setOccupation("occupation");

        /*collections and objects
        CommitteeDto committeeDto = new CommitteeDto();
        committeeDto.setId("committeeID");
        committeeDto.setName("committee");
        Set<CommitteeDto> committeeDtoSet = new HashSet<>();
        committeeDtoSet.add(committeeDto);
        contactDto.setCommittees(committeeDtoSet);

        OrganizationDto organizationDto = new OrganizationDto();
        organizationDto.setName("organizationName");
        organizationDto.setId("organizationID");
        Set<OrganizationDto> organizationDtoSet = new HashSet<>();
        organizationDtoSet.add(organizationDto);
        contactDto.setOrganizations(organizationDtoSet);

        MemberInfoDto memberInfoDto = new MemberInfoDto();
        memberInfoDto.setId("memberInfoID");
        memberInfoDto.setSignedAgreement(true);
        memberInfoDto.setPaidDues(true);
        memberInfoDto.setStatus(1);
        contactDto.setMemberInfo(memberInfoDto);


        Contact contact = contactDto.convertToContact();

        /*basic fields
        assertNotNull(contact);
        assertEquals(contact.getId(), contactDto.getId());
        assertEquals(contact.getFirstName(), contactDto.getFirstName());
        assertEquals(contact.getMiddleName(), contactDto.getMiddleName());
        assertEquals(contact.getLastName(), contactDto.getLastName());
        assertEquals(contact.getStreetAddress(), contactDto.getStreetAddress());
        assertEquals(contact.getAptNumber(), contactDto.getAptNumber());
        assertEquals(contact.getCity(), contactDto.getCity());
        assertEquals(contact.getZipCode(), contactDto.getZipCode());
        assertEquals(contact.getLanguage(), contactDto.getLanguage());
        assertEquals(contact.getEmail(), contactDto.getEmail());
        assertEquals(contact.getPhoneNumber1(), contactDto.getPhoneNumber1());
        assertEquals(contact.getPhoneNumber2(), contactDto.getPhoneNumber2());
        assertEquals(contact.getAssessment(), contactDto.getAssessment());
        assertEquals(contact.getOccupation(), contactDto.getOccupation());

        /*collections and objects
        assertNotNull(contact.getCommittees());
        assertEquals(contact.getCommittees().size(), 1);
        assertEquals(contact.getCommittees().iterator().next().getName(), committeeDto.getName());
        assertNotNull(contact.getOrganizations());
        assertEquals(contact.getOrganizations().size(), 1);
        assertEquals(contact.getOrganizations().iterator().next().getName(), organizationDto.getName());
        assertNotNull(contact.getMemberInfo());
        assertNotNull(contact.getMemberInfo().getId(),memberInfoDto.getId());
        assertEquals(contact.getMemberInfo().getStatus(),memberInfoDto.getStatus());
        assertEquals(contact.getMemberInfo().hasPaidDues(), contactDto.getMemberInfo().hasPaidDues());
        assertEquals(contact.getMemberInfo().hasSignedAgreement(),contactDto.getMemberInfo().hasSignedAgreement());
        */

    }
}
