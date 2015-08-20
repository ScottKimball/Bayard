(function () {
    'use strict';

    var controllers = angular.module('controllers', []);

    controllers.controller('ContactsCtrl', ['$scope', 'ContactService', '$location', function($scope, ContactService, $location) {

        ContactService.findAll({}, function(data) {
            $scope.contacts = data;
        }, function(err) {
            console.log(err);
        });

        $scope.viewContactDetails = function(contactId) {
            $location.path("/contacts/contact/"+contactId);
        }

    }]);

    controllers.controller('MainCtrl', ['$scope', function($scope) {
        $scope.testMessage = "Check out our home!";
    }]);

    controllers.controller('CreateContactCtrl', ['$scope', 'ContactService', '$location', '$timeout', function($scope, ContactService, $location, $timeout) {

        $scope.errorMessage = "";
        $scope.success = null;

        $scope.submit = function() {

            ContactService.create({}, $scope.newContact, function(data) {
                console.log(data);
                $scope.newContactForm.$setPristine();
                $scope.newContact = {};

                $scope.requestSuccess = true;
                $timeout(function() {
                    $scope.requestSuccess = false;
                }, 3000)
            }, function (err) {
                console.log(err);
                $scope.errorMessage = err;

                $scope.requestError = true;
                $timeout(function() {
                    $scope.requestError = false;
                }, 3000)
            });
        };

        $scope.submitAndViewDetails = function() {

            ContactService.create({}, $scope.newContact, function(postSuccess) {
                postSuccess.$promise.then(function(createdId) {
                    var detailsPath = "/contacts/contact/" + createdId.id;
                    $location.path(detailsPath);
                });
            }, function(err) {
                console.log(err);
                $scope.errorMessage = err;
                $scope.requestError = true;
                $timeout(function() {
                    $scope.requestError = false;
                }, 3000)
            });

        }

    }]);

    controllers.controller('DetailsCtrl', ['$scope', '$routeParams', 'ContactService', '$timeout', '$location', 'OrganizationService',
        'EventService', 'CommitteeService', 'DateFormatter', '$window',
        function ($scope, $routeParams, ContactService, $timeout, $location, OrganizationService, EventService, CommitteeService, DateFormatter, $window) {

            var setup = function () {
                $scope.editingBasicDetails = false;
                $scope.success = null;
                $scope.errorMessage = "";
                $scope.addingEncounter = false;
                $scope.encounterSuccess = true;
                $scope.initiator = null;
                $scope.organizations = null;
                $scope.addOrganization = {hidden: true};
                $scope.newOrganization = {hidden: true};
                $scope.addEvent = {hidden: true};
                $scope.addCommittee = {hidden: true};
                $scope.modelHolder = {encounterModel : {},
                                        organizationModel : {}};
                $scope.showingDemographics = false;
                $scope.demographicPanel = {
                    updateRequest: {success: false, failure: false},
                    editingDemographics: false,
                    showingDemographics: false
                };
                $scope.memberInfoPanel = {
                    showingPanel: false, updateRequest: {success: false, failure: false},
                    showingMemberInfo: false, editingMemberInfo: false,
                    standings: {
                        good: {
                            label: "Good",
                            value: 1
                        },
                        bad: {
                            label: "Bad",
                            value: 2
                        },
                        other: {
                            label: "Other",
                            value: 3
                        }
                    }
                };

                //TODO: decouple this knowledge
                $scope.assessmentRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

                //TODO: decouple this knowledge
                $scope.encounterTypes = ["Call", "Other"];


                ContactService.find({id: $routeParams.id}, function (data) {
                    $scope.contact = data;
                }, function (err) {
                    console.log(err);
                });

                $scope.modelHolder = {};
                $scope.formHolder = {};

            };

            var establishBasicDetails = function(id) {
                ContactService.find({id: id}, function (data) {
                    $scope.contact = data;
                }, function (err) {
                    console.log(err);
                });
            };

            setup();
            establishBasicDetails($routeParams.id);

            /*Basic details*/
            $scope.updateBasicDetails = function () {
                ContactService.update({id: $scope.contact.id}, $scope.contact, function (data) {
                    establishBasicDetails($scope.contact.id);
                    $scope.contactUpdated = true;
                    $timeout(function () {
                        $scope.contactUpdated = false;
                    }, 3000);
                }, function (err) {
                    console.log(err);
                });
            };

            $scope.cancelUpdateBasicDetails = function() {
                $scope.editingBasicDetails = false;
                establishBasicDetails($scope.contact.id);
            };


            $scope.viewDetails = function (id) {
                var path = "/contacts/contact/" + id;
                $location.path(path);
            };

            /*Encounters*/
            $scope.showEncounterForm = function () {
                $scope.addingEncounter = !$scope.addingEncounter;
                populateInitiatorList();
            };

            var populateInitiatorList = function () {
                if ($scope.initiators == null) {

                    ContactService.getInitiators({}, function (data) {
                        $scope.initiators = data;

                    }, function (err) {
                        console.log(err);
                    });
                }
            };


            $scope.addEncounter = function () {

                $scope.modelHolder.encounterModel.encounterDate = DateFormatter.formatDate($scope.modelHolder.encounterModel.jsDate);

                ContactService.createEncounter({id: $scope.contact.id}, $scope.modelHolder.encounterModel, function (data) {
                    ContactService.getEncounters({id: $scope.contact.id}, function (encounters) {
                        $scope.newEncounterRequestSuccess = true;
                        $scope.modelHolder.encounterModel = {};

                        $timeout(function () {
                            $scope.newEncounterRequestSuccess = false;
                        }, 3000);

                        $scope.encountersTable = encounters;
                        $scope.addingEncounter = false;

                    }, function (err) {
                        $scope.newEncounterRequestFailure = true;
                        $timeout(function () {
                            $scope.newEncounterRequestFailure = false;
                        }, 3000);
                        console.log(err);
                    });

                    ContactService.find({id: $scope.contact.id}, function (contact) {
                        $scope.contact = contact;
                    }, function (err) {
                        console.log(err);
                    })

                }, function (err) {
                    $scope.newEncounterRequestFailure = true;
                    $timeout(function () {
                        $scope.newEncounterRequestFailure = false;
                    }, 3000);
                    console.log(err);
                });
            };

            $scope.cancelAddEncounter = function() {
                $scope.modelHolder.encounterModel = {};
                $scope.addingEncounter = false;
            };

            $scope.showUpdateEncounterForm = function () {
                $scope.updatingEncounter = true;
                populateInitiatorList();
            };

            $scope.deleteEncounter = function (encounterId) {

                var deleteConfirmed = $window.confirm('Are you sure you want to delete this encounter?');
                if (deleteConfirmed) {
                    ContactService.deleteEncounter({id: $scope.contact.id, entityId: encounterId}, function (succ) {
                        ContactService.getEncounters({id: $scope.contact.id}, function (encounters) {
                            $scope.encountersTable = encounters;
                        }, function (err) {
                            console.log(err);
                        })
                    }, function (err) {
                        console.log(err);
                    });
                }

            };

            $scope.updateEncounter = function () {

                $scope.modelHolder.encounterModel.encounterDate = DateForbtter.formatDate($scope.modelHolder.encounterModel.jsDate);
                ContactService.updateEncounter({id: $scope.contact.id, entityId: $scope.modelHolder.encounterModel.id}, $scope.modelHolder.encounterModel, function (succ) {
                    $scope.updatingEncounter = false;
                    ContactService.getEncounters({id: $scope.contact.id}, function (encounters) {
                        $scope.modelHolder.encounterModel = {};
                        $scope.encountersTable = encounters;
                    }, function (err) {
                        console.log(err);
                    });

                    //Fetch updated assessment and follow up
                    ContactService.find({id: $scope.contact.id}, function (contact) {
                        $scope.contact = contact;
                    }, function (err) {
                        console.log(err);
                    })
                }, function (err) {
                    console.log(err);
                })

            };

            $scope.cancelUpdateEncounter = function () {
                $scope.updatingEncounter = false;
            };

            var createEncounterDetails = function (encounter, initiator) {
                var encounterDetails = encounter;
                var initiatorName = initiator.firstName + " " + initiator.lastName;
                encounterDetails["initiatorName"] = initiatorName;
                encounterDetails["initiatorId"] = initiator.id;
                encounterDetails["jsDate"] = DateFormatter.asDate(encounter.encounterDate);
                return encounterDetails;
            };

            $scope.viewEncounterDetails = function (encounter) {

                ContactService.find({id: encounter.initiator.id}, function (initiator) {
                    $scope.modelHolder.encounterModel = createEncounterDetails(encounter, initiator);
                }, function (err) {
                    console.log(err);
                });

            };

            $scope.displayEncounters = function () {
                $scope.showingEncounters = !$scope.showingEncounters;

                if ($scope.showingEncounters == true) {
                    ContactService.getEncounters({id: $scope.contact.id}, function (data) {
                        $scope.encountersTable = data;
                    }, function (err) {
                        console.log(err);
                    });
                }
            };

            /*Events */

            $scope.toggleShowingEvents = function () {
                ContactService.getEvents({id: $scope.contact.id}, function (data) {
                    $scope.contact.attendedEvents = data;
                    $scope.eventsTable = $scope.contact.attendedEvents;

                }, function (err) {
                    console.log(err);
                });
                $scope.showingEvents = !$scope.showingEvents;
            };

            $scope.getEvents = function () {
                $scope.addEvent.hidden = false;

                EventService.findAll({}, function (response) {
                    console.log(response);
                    $scope.events = response;
                }, function (err) {
                    console.log(err);
                });

            };

            $scope.attendEvent = function (eventId) {

                var idDto = {id: eventId};

                ContactService.attend({id: $scope.contact.id}, idDto, function (response) {
                    ContactService.getEvents({id: $scope.contact.id}, function (data) {
                        $scope.contact.attendedEvents = data;
                        $scope.eventsTable = $scope.contact.attendedEvents;
                    }, function (err) {
                        console.log(err);
                    });

                    $scope.addEvent.hidden = true;
                    $timeout(function () {
                        $scope.requestSuccess = false;
                    }, 3000);

                }, function (err) {
                    console.log(err);
                });

            };

            $scope.removeFromEvent = function (eventId) {
                ContactService.removeFromEvent({id: $scope.contact.id, entityId: eventId}, function (success) {
                    ContactService.getEvents({id: $scope.contact.id}, function (data) {
                        $scope.contact.attendedEvents = data;
                        $scope.eventsTable = $scope.contact.attendedEvents;
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    console.log(err);
                });
            };


            /* Organizations */

            $scope.getContactOrganizations = function () {
                $scope.showingOrganizations = !$scope.showingOrganizations;

                if ($scope.showingOrganizations == true) {
                    ContactService.getOrganizations({id: $scope.contact.id}, function (data) {
                        $scope.contact.organizations = data
                    }, function (err) {
                        console.log(err);
                    });
                }
            };

            $scope.getOrganizations = function () {
                $scope.addOrganization.hidden = !$scope.addOrganization.hidden;

                if ($scope.organizations == null) {
                    OrganizationService.findAll({}, function (data) {
                        $scope.organizations = data;
                    }, function (err) {
                        console.log(err);
                    });
                }
            };

            $scope.addToOrganization = function (index) {
                $scope.organizationSuccess = true;
                var organization = $scope.organizations[index];

                ContactService.addToOrganization({id: $scope.contact.id}, {id: organization.id},
                    function (data) {
                            ContactService.getOrganizations({id: $scope.contact.id}, function (data) {
                                $scope.contact.organizations = data
                            }, function (err) {
                                console.log(err);
                            });

                    }, function (err) {
                        console.log(err);
                    });

            };

            $scope.createAndAddToOrganization = function () {
                OrganizationService.create($scope.modelHolder.organizationModel, function (data) {
                    //Add this contact to the newly-created Organization
                    ContactService.addToOrganization({id: $scope.contact.id}, {id: data.id}, function (data) {
                        //Refresh organizations the contact is now a member of
                        ContactService.getOrganizations({id: $scope.contact.id}, function (data) {
                            $scope.contactUpdated = true;
                            $scope.contact.organizations = data;
                            $scope.addOrganization.hidden = true;
                            $scope.newOrganization.hidden = true;
                            $scope.modelHolder.organizationModel = {};
                        }, function (err) {
                            console.log(err);
                            $scope.organizationSuccess = false;
                        });
                    }, function (err) {
                        console.log(err);
                        $scope.organizationSuccess = false;
                    });
                }, function (err) {
                    console.log(err);
                    $scope.organizationSuccess = false;
                });

                //Refresh list of all organizations known to the app
                OrganizationService.findAll(function (allOrgs) {
                    $scope.organizations = allOrgs;
                }, function (err) {
                    console.log(err);
                });
            };

            $scope.removeFromOrganization = function (id) {

                ContactService.removeFromOrganization({id: $scope.contact.id, entityId: id}, function (resp) {
                    ContactService.getOrganizations({id: $scope.contact.id}, function (orgs) {
                        $scope.contact.organizations = orgs;
                    }, function (err) {
                        console.log(err);
                    })
                }, function (err) {
                    console.log(err);
                })
            };

            /* Committees */
            $scope.getContactCommittees = function () {
                $scope.showingCommittees = !$scope.showingCommittees;

                if ($scope.contact.committees == null) {
                    ContactService.getCommittees({id: $scope.contact.id}, function (data) {
                        $scope.contact.committees = data
                    }, function (err) {
                        console.log(err);
                    });
                }
            };
            $scope.getCommittees = function () {
                $scope.addCommittee.hidden = !$scope.addCommittee.hidden;

                if ($scope.committees == null) {
                    CommitteeService.findAll({}, function (data) {
                        $scope.committees = data;
                    }, function (err) {
                        console.log(err);
                    });
                }
            };


            $scope.addToCommittee = function (index) {
                $scope.committeeSuccess = true;
                var committee = $scope.committees[index];

                ContactService.addToCommittee({id: $scope.contact.id}, {id: committee.id},
                    function (data) {

                            ContactService.getCommittees({id: $scope.contact.id}, function (data) {
                                $scope.contact.committees = data
                            }, function (err) {
                                console.log(err);
                            });

                    }, function (err) {
                        console.log(err);
                    });
            };

            $scope.removeFromCommittee = function (committeeId) {

                ContactService.removeFromCommittee({
                    id: $scope.contact.id,
                    entityId: committeeId
                }, function (success) {
                    ContactService.getCommittees({id: $scope.contact.id}, function (committees) {
                        $scope.contact.committees = committees;
                    }, function (err) {
                        console.log(err);
                    })
                }, function (err) {
                    console.log(err);
                })

            };

            /* Demographics*/

            $scope.toggleEditingDemographics = function () {
                $scope.demographicPanel.editingDemographics = !$scope.demographicPanel.editingDemographics;
            };

            $scope.booleanToString = function (value) {
                if (value) {
                    return "Yes";
                }
                return "No";
            };

            var retrieveDemographics = function () {
                return ContactService.getDemographics({id: $scope.contact.id}, function (demographics) {
                    $scope.demographics = demographics;
                    $scope.demographics.dobAsDate = DateFormatter.asDate($scope.demographics.dateOfBirth);
                    return true;
                }, function (err) {
                    console.log(err);
                    return false;
                });
            };

            $scope.displayDemographics = function () {
                $scope.demographicPanel.showingDemographics = !$scope.demographicPanel.showingDemographics;
                retrieveDemographics();
            };

            $scope.updateDemographics = function () {

                $scope.demographics.dateOfBirth = DateFormatter.formatDate($scope.demographics.dobAsDate);
                ContactService.updateDemographics({id: $scope.contact.id}, $scope.demographics, function (data) {
                    if (retrieveDemographics()) {
                        $scope.demographicPanel.editingDemographics = false;
                        $scope.demographicPanel.updateRequest.success = true;
                        $timeout(function () {
                            $scope.demographicPanel.updateRequest.success = false;
                        }, 3000);
                    } else {
                        $scope.demographicPanel.updateRequest.failure = true;
                        $timeout(function () {
                            $scope.demographicPanel.updateRequest.failure = false;
                        }, 3000);
                    }
                }, function (err) {
                    console.log(err);
                    $scope.demographicPanel.updateRequest.failure = true;
                    $timeout(function () {
                        $scope.demographicPanel.updateRequest.failure = false;
                    }, 3000);
                })
            };

            $scope.cancelUpdateDemographics = function () {
                if (retrieveDemographics()) {
                    $scope.demographicPanel.editingDemographics = false;
                }
            };

            /* MEMBERINFO */

            $scope.toggleMemberInfoPanel = function () {
                $scope.memberInfoPanel.showingPanel = !$scope.memberInfoPanel.showingPanel;

                if ($scope.contact.member == true) {
                    $scope.displayMemberInfo();
                } else {
                    $scope.promptNoMemberInfo();
                }
            };

            $scope.promptNoMemberInfo = function () {
                $scope.promptNotMember = true;
            };

            $scope.becomeMember = function () {
                $scope.displayMemberInfo();
                $scope.toggleEditingMemberInfo();
            };

            $scope.updateMembershipInfo = function () {
                ContactService.updateMemberInfo({id: $scope.contact.id}, $scope.memberInfo, function (data) {
                    ContactService.getMemberInfo({id: $scope.contact.id}, function (data) {
                        $scope.contact.member = true;
                        $scope.promptNotMember = false;
                        $scope.memberInfoPanel.editingMemberInfo = false;
                        $scope.memberInfoPanel.updateRequest.success = true;
                        $timeout(function () {
                            $scope.memberInfoPanel.updateRequest.success = false;
                        }, 3000);
                    }, function (err) {
                        console.log(err);
                        $scope.memberInfoPanel.updateRequest.failure = true;
                        $timeout(function () {
                            $scope.memberInfoPanel.updateRequest.failure = false;
                        }, 3000);
                    })
                }, function (err) {
                    console.log(err);
                    $scope.memberInfoPanel.updateRequest.failure = true;
                    $timeout(function () {
                        $scope.memberInfoPanel.updateRequest.failure = false;
                    }, 3000);
                })
            };


            $scope.displayMemberInfo = function () {

                $scope.memberInfoPanel.showingMemberInfo = !$scope.memberInfoPanel.showingMemberInfo;

                if ($scope.memberInfoPanel.showingMemberInfo) {
                    ContactService.getMemberInfo({id: $scope.contact.id}, function (data) {
                        $scope.memberInfo = data;
                    }, function (err) {
                        console.log(err);
                    });
                }
            };

            $scope.toggleEditingMemberInfo = function () {
                $scope.memberInfoPanel.editingMemberInfo = !$scope.memberInfoPanel.editingMemberInfo;
            };

            $scope.cancelUpdateMemberInfo = function () {
                ContactService.getMemberInfo({id: $scope.contact.id}, function (data) {
                    $scope.memberInfo = data;
                    $scope.memberInfoPanel.editingMemberInfo = false;
                    if (!$scope.contact.member) {
                        $scope.memberInfoPanel.showingMemberInfo = false;
                    }
                }, function (err) {
                    console.log(err);
                });
            };


        }]);

    controllers.controller('EventsCtrl', ['$scope', 'EventService', 'CommitteeService', 'DateFormatter', function($scope, EventService, CommitteeService, DateFormatter) {

        $scope.addEvent = {hidden: true};
        $scope.formHolder = {};
        $scope.modelHolder = {};

        var populateEvents = function() {
            EventService.findAll({}, function(response) {
                $scope.eventsTable = response;
            }, function(err) {
                console.log(err);
            });
        };

        populateEvents();

        $scope.createEvent = function() {

            $scope.modelHolder.eventModel.dateHeld = DateFormatter.formatDate($scope.modelHolder.eventModel.jsDate);

                $scope.modelHolder.eventModel.attendees = [];
                EventService.create({}, $scope.modelHolder.eventModel, function(response) {
                    $scope.addEvent = {hidden : true};
                    $scope.clashingName = false;
                    populateEvents();
                    $scope.modelHolder.eventModel = {};
                }, function(err) {
                    //TODO inspect error response for validation failures
                    console.log(err);
                });
        };

    }]);


    controllers.controller('EventDetailsCtrl', ['$scope', 'EventService', '$routeParams', 'CommitteeService', '$timeout', '$window', '$location', 'DateFormatter',
        function($scope, EventService, $routeParams, CommitteeService, $timeout, $window, $location, DateFormatter) {

            $scope.modelHolder = {};
            $scope.formHolder = {};

            var formatEvent = function(event) {
                event.jsDate = DateFormatter.asDate(event.dateHeld);
                if (event.attendees == null) {
                    event.attendees = [];
                }
                return event;
            };

            EventService.find({id : $routeParams.id}, function(event) {
                $scope.modelHolder.eventModel = formatEvent(event);
            }, function(err) {
                console.log(err);
            });

            $scope.showUpdateForm = function() {
                $scope.updatingEventDetails = true;
            };

            $scope.submitUpdate = function() {

                $scope.modelHolder.eventModel.dateHeld = DateFormatter.formatDate($scope.modelHolder.eventModel.jsDate);

                EventService.update({id : $scope.modelHolder.eventModel.id}, $scope.modelHolder.eventModel, function(success) {
                    EventService.find({id : $scope.modelHolder.eventModel.id}, function(event) {
                        $scope.modelHolder.eventModel = formatEvent(event);
                        $scope.requestSuccess = true;
                        $scope.updatingEventDetails = false;
                        $timeout(function() {
                            $scope.requestSuccess = false;
                        }, 3000)
                    }, function(err) {
                        console.log(err);
                    });
                }, function(err) {
                    $scope.requestFail = true;
                    $timeout(function() {
                        $scope.requestFail = false;
                    }, 3000);
                    console.log(err);
                });

            };

            $scope.cancelUpdate = function() {
                $scope.updatingEventDetails = false;

                EventService.find({id : $scope.modelHolder.eventModel.id}, function(event) {
                    $scope.modelHolder.eventModel = formatEvent(event)
                }, function(err) {
                    console.log(err);
                });
            };

            $scope.deleteEvent = function() {

                var deleteConfirmed = $window.confirm('Are you sure you want to delete this event?');
                if (deleteConfirmed) {
                    EventService.delete({id : $scope.modelHolder.eventModel.id}, function() {
                        $location.path("/events");
                    }, function(err) {
                        console.log(err);
                    });
                }

            };

        }]);

    controllers.controller('EventFormCtrl', ['$scope', 'CommitteeService', function($scope, CommitteeService) {

        CommitteeService.findAll({}, function(data) {
            $scope.committees = data;
            $scope.committees.push({id: null, name: "None"});
        }, function(err) {
            console.log(err);
        });

    }]);


    controllers.controller('OrganizationFormCtrl', ['$scope', function($scope) {

    }]);

    controllers.controller('OrganizationsCtrl', ['$scope', 'OrganizationService', function($scope, OrganizationService) {

        $scope.modelHolder = {};
        $scope.formHolder = {};
        $scope.hideForm = true;

        OrganizationService.findAll({}, function(data) {
            $scope.organizations = data;
        }, function(err) {
            console.log(err);
        });

        $scope.showOrganizationForm = function() {
            $scope.hideForm = false;
        };

        $scope.createOrganization = function() {
            $scope.modelHolder.organizationModel.members = [];
            OrganizationService.create( $scope.modelHolder.organizationModel, function(data) {
                $scope.hideForm = true;
                $scope.modelHolder.organizationModel = {};
                OrganizationService.findAll({}, function(data) {
                    $scope.organizations = data;
                }, function(err) {
                    console.log(err);
                });
            }, function(err) {
                console.log(err);
            });
        };

        $scope.cancelCreateOrganization = function() {
            $scope.hideForm = true;
        };

    }]);

    controllers.controller('OrganizationDetailsCtrl', ['$scope', 'OrganizationService', '$routeParams', '$location', '$window', '$timeout',
        function($scope, OrganizationService, $routeParams, $location, $window, $timeout) {

        $scope.formHolder = {};
        $scope.modelHolder = {};

        OrganizationService.find({id : $routeParams.id}, function(data) {
            $scope.modelHolder.organizationModel = data;
            if ($scope.modelHolder.organizationModel.members == null) {
                $scope.modelHolder.organizationModel.members = [];
            }
        }, function(err) {
            console.log(err);
        });

        $scope.showUpdateForm = function() {
            $scope.updatingOrganizationDetails = true;
        };

        $scope.cancelUpdate = function() {
            $scope.updatingOrganizationDetails = false;

            OrganizationService.find({id : $routeParams.id}, function(data) {
                $scope.modelHolder.organizationModel = data;
                if ($scope.modelHolder.organizationModel.members == null) {
                    $scope.modelHolder.organizationModel.members = [];
                }
            }, function(err) {
                console.log(err);
            });
        };

        $scope.deleteOrganization = function() {
            var deleteConfirmed = $window.confirm('Are you sure you want to delete this organization?');
            if (deleteConfirmed) {
                OrganizationService.delete({id : $scope.modelHolder.organizationModel.id}, function() {
                    $location.path("/organizations");
                }, function(err) {
                    console.log(err);
                });
            }

        };

        $scope.submitUpdate = function() {
            OrganizationService.update({id : $scope.modelHolder.organizationModel.id}, $scope.modelHolder.organizationModel, function(data) {
                $scope.updatingOrganizationDetails = false;
                $scope.requestSuccess = true;
                $timeout(function() {
                    $scope.requestSuccess = false;
                }, 3000)
            }, function(err) {
                $scope.requestFail = true;
                $timeout(function() {
                    $scope.requestFail = false;
                }, 3000);
                console.log(err);
            })
        };

    }]);

    controllers.controller ('CommitteesCtrl',['$scope', 'CommitteeService', '$window', function($scope, CommitteeService, $window){

        var setup = function () {
            $scope.panels = [];
            $scope.addCommittee = {hidden: true};

            CommitteeService.findAll({}, function(data) {
                $scope.committees = data;
                for (var i = 0; i < $scope.committees.size; i++) {
                    $scope.panels.push({"hidden" : true});
                }

            }, function(err) {
                console.log(err);
            });
        };

        setup();

        $scope.createCommittee = function(name) {
            var committee = {name: name, members: []};

            CommitteeService.create( committee, function(data) {
                $scope.addCommittee = {hidden: true};
                setup();

            }, function(err) {
                console.log(err);
            });
        };

        $scope.showUpdateForm = function() {
            $scope.updatingCommittee = true;
            $scope.newCommitteeName = "";

        };

        $scope.cancelUpdate = function() {
            $scope.updatingCommittee = false;

        };

        $scope.submitUpdate = function(committee, name) {
            committee.name = name;

            CommitteeService.update({id : committee.id}, committee, function(success) {
                $scope.updatingCommittee = false;
            }, function(err) {
                console.log(err);
            });
        };

        $scope.deleteCommittee = function(committee) {

            var deleteConfirmed = $window.confirm('Are you sure you want to delete this committee?');
            if (deleteConfirmed) {
                CommitteeService.delete({id : committee.id}, function(success) {
                    CommitteeService.findAll({}, function(data) {
                        $scope.committees = data;
                    }, function(err) {
                        console.log(err);
                    })
                }, function(err) {
                    console.log(err);
                });
            }

        };

    }]);


    controllers.controller ('LoginCtrl',['$scope','$rootScope', '$location', 'UserService','$http', function($scope,$rootScope, $location, UserService, $http){
        $scope.error = false;

        var authenticate = function(credentials, callback) {

            var headers = credentials ? {authorization : "Basic "
            + btoa(credentials.username + ":" + credentials.password)
            } : {};

            $http.get('/users/authenticate', {headers : headers}).success(function(data) {
                if (data.email) {
                    $rootScope.authenticated = true;
                    $rootScope.user = data;
                } else {
                    $rootScope.authenticated = false;
                }
                callback && callback();
            }).error(function() {
                $rootScope.authenticated = false;
                callback && callback();
            });

        }

        authenticate();
        $scope.credentials = {};

        $scope.login = function() {
            authenticate($scope.credentials, function() {
                if ($rootScope.authenticated) {
                    $location.path("/");
                    $scope.error = false;
                } else {
                    $location.path("/login");
                    $scope.error = true;
                }
            });
        };
    }]);
}());



