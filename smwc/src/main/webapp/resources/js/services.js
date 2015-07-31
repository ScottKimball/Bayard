(function () {
    'use strict';

    /* Services */

    var services = angular.module('services', ['ngResource']);

    services.factory('DateFormatter', ['$filter', function($filter) {
        return {
            formatDate : function(date) {
                return $filter('date')(date, 'yyyy-MM-dd');
            },
            asDate: function(string) {
                //prevent html input date from misinterpreting midnight
                var date = new Date(string);
                var localTime = date.getTime();
                var localOffset = date.getTimezoneOffset() * 60000;
                return new Date(localTime + localOffset);
            },
            getDateFormat : function() {
                return 'yyyy-MM-dd';
            }
        }
    }]);

    services.factory('ContactService',[ '$resource', function ($resource) {
        return $resource('../contacts/:id', {id : '@id'}, {
            update : {
                method: 'PUT',
                params: {
                    id: "@id"
                }
            },
            find : {
                method: 'GET',
                params: {
                    id : "@id"
                }
            },
            findAll : {
                method: 'GET',
                isArray : true
            },
            create : {
                method: 'POST'
            },
            attend: {
                method: 'PUT',
                url: "../contacts/:id/events"
            },
            getEncounters : {
                method: 'GET',
                isArray : true,
                url: "../contacts/:id/encounters"
            },
            getInitiators : {
                method: 'GET',
                isArray : true,
                url: "../contacts/initiators"
            },
            getEvents : {
                method: 'GET',
                isArray : true,
                url: "../contacts/:id/events"
            },
            getOrganizations : {
                method: 'GET',
                isArray : true,
                url : "/contacts/:id/organizations"
            },
            addToOrganization : {
                method: 'PUT',
                url : "/contacts/:id/organizations"
            },
            createEncounter : {
                method : 'PUT',
                url: "/contacts/:id/encounters"
            },
            getDemographics : {
                method : 'GET',
                url: "/contacts/:id/demographics"
            },
            updateDemographics : {
                method: 'PUT',
                url: "/contacts/:id/demographics",
            },
            addToCommittee : {
                method : 'PUT',
                url : "/contacts/:id/committees"
            },
            getCommittees : {
                method : 'GET',
                isArray : true,
                url : "/contacts/:id/committees"
            },
            getMemberInfo : {
                method : "GET",
                url : "/contacts/:id/memberinfo"
            },
            updateMemberInfo : {
                method : "PUT",
                url : "/contacts/:id/memberinfo"
            }
        });
    }]);

    services.factory('OrganizationService',[ '$resource', function ($resource) {
        return $resource('../organizations/:id', {id : '@id'}, {
            update : {
                method: 'PUT',
                params: {
                    id: "@id"
                }
            },
            find : {
                method: 'GET',
                params: {
                    id : "@id"
                }
            },
            findAll : {
                method: 'GET',
                isArray : true
            },
            create : {
                method: 'POST'
            }
        });
    }]);

    services.factory('EventService',[ '$resource', function ($resource) {
        return $resource('../events/:id', {id : '@id'}, {
            update : {
                method: 'PUT',
                params: {
                    id: "@id"
                }
            },
            find : {
                method: 'GET',
                params: {
                    id : "@id"
                }
            },
            findAll : {
                method: 'GET',
                isArray : true
            },
            create : {
                method: 'POST'
            }
        });
    }]);

    services.factory('CommitteeService',[ '$resource', function ($resource) {
        return $resource('../committees/:id', {id : '@id'}, {
            update : {
                method: 'PUT',
                params: {
                    id: "@id"
                }
            },
            find : {
                method: 'GET',
                params: {
                    id : "@id"
                }
            },
            findAll : {
                method: 'GET',
                isArray : true
            },
            create : {
                method: 'POST'
            }
        });
    }]);

    services.factory('UserService',[ '$resource', function ($resource) {
        return $resource('../users/:id', {id : '@id'}, {

            find : {
                method: 'GET',
                params: {
                    id : "@id"
                }
            },
            findAll : {
                method: 'GET',
                isArray : true
            },
            create : {
                method: 'POST'
            },
            authenticate : {
                method : 'GET',
                url : '/users/authenticate'
            }
        });
    }]);

}());