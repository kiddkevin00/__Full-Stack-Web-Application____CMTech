'use strict';

angular.module('qiApp').controller('ProjectCtrl', function($scope, $http, $modal, socket, Auth, $location) {
    $scope.user = Auth.getCurrentUser();
    $scope.main = {};
    $scope.createMainModal = function() {
        var modalInstance = $modal.open({
            templateUrl: "/components/modal/modal.html",
            size: "md",
            controller: CreateMainModalCtrl,
            resolve: {
                user: function() {
                    return $scope.user
                }
            }
        });
        modalInstance.result.then(function(ctrl) {
            if (ctrl) {
                socket.syncUpdateUser(Auth.getCurrentUser());
                console.log("Form Submitted");
            }
        });
    };
    $scope.createProjectModal = function(form) {

        var modalInstance = $modal.open({
            templateUrl: "/components/modal/modal_createproject.html",
            size: "md",
            controller: CreateMainModalCtrl,
            resolve: {
                user: function() {
                    return $scope.user
                }
            }
        });
        modalInstance.result.then(function(ctrl) {
            if (ctrl) {
                socket.syncUpdateUser(Auth.getCurrentUser());
                console.log("Form Submitted");
            }
        });
    };
    var CreateMainModalCtrl = function($scope, $modalInstance, user) {
        $scope.emails = [];
        $scope.modalURL = "/components/modal/modal_createproject.html";
        //$scope.modalURL = "/components/modal/modal_inviteuser.html";
        $scope.submitProject = function() {
            $scope.submitted = true;
            if ($scope.form.$invalid) return;
            $scope.modalURL = "/components/modal/modal_createcompany.html";
            $scope.submitted = false;
        }
        $scope.submitCompany = function() {
            $scope.submitted = true;
            if ($scope.form.$invalid) return;
            $scope.modalURL = "/components/modal/modal_inviteuser.html";
            $scope.submitted = false;
        };
        $scope.addEmail = function() {
            $scope.submitted = true;
            if ($scope.form.$invalid) return;
            $scope.emails.push($scope.email);
            $scope.submitted = false;
        };
        $scope.project = {};
        $scope.errors = {};
        $scope.pickImage = function() {
            filepicker.setKey("Ash9bU3IkR1Cf41AiwTAjz");
            filepicker.pick({
                mimetypes: ['image/*'],
                container: 'modal',
                services: ['COMPUTER']
            }, function(Blob) {
                $scope.project.blob = Blob;
                filepicker.read(Blob, { base64encode: true }, function(imgdata) {
                    $scope.$apply(function() {
                        $scope.imageSrc = 'data:image/png;base64,' + imgdata;
                        console.log("Read successful!");
                    });
                }, function(fperror) {
                    console.log(fperror.toString());
                });
            }, function(FPError) {
                console.log(FPError.toString());
            });
        };
        $scope.createProject = function() {
            $scope.submitted = true;
            if ($scope.form.$valid && $scope.project.blob) {
                $scope.project.project_image_url = $scope.project.blob.url;
                $http.post("/api/companies", $scope.company).success(function(companyID) {
                    $http.post("/api/projects", $scope.project).success(function(data) {
                        $http.post("/api/tbl_user_company_projects", {
                            link_user: user._id,
                            link_company: companyID,
                            link_project: data._id
                        }).success(function() {
                            $http.post("/api/messages", {
                                userId: user._id,
                                projectId: data._id,
                                recipients: $scope.emails
                            }).success(function() {
                                $modalInstance.close(true);
                            });
                        })
                    });
                });
            } else {
                console.log("Form Invalid");
            }
        };
        $scope.cancel = function() {
            $modalInstance.close(false);
        };
    };
});

