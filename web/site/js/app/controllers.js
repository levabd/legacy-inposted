'use strict';

/* Controllers */

app.controller('inposted.controllers.main', function ($scope, $timeout, Interest, Post, settings) {
    $scope.newPost = new Post();

    $scope.createNewPost = function () {
        var interests = getFilters();
        var post = $scope.newPost;
        if (!(post.content && post.content.length)) {
            post.error = 'Write something';
        }
        else if (interests.length) {
            post.inInterests = interests;
            post.$save(
                function (saved) {
                    $scope.posts.unshift(saved);
                    $scope.newPost = new Post();
                }
            );
        }
        else {
            post.error = 'Select some interests';
        }
    };

    $scope.settings = settings;

    $scope.interests = Interest.query();

    var getFilters = function () {
        var i;
        var filters = [];
        for (i = 0; i < $scope.interests.length; i++) {
            if ($scope.interests[i].checked) {
                filters.push($scope.interests[i].id);
            }
        }

        return filters;
    };

    $scope.sort = {
        value: 'date',
        change: function (value, $event) {
            $event.preventDefault();
            this.value = value;
            loadPosts();
        }
    };

    var loadPosts = function () {
        Post.query(
            {sort: $scope.sort.value, 'interests': getFilters()},
            function (data) {
                $scope.posts = data;
            }
        );
    };
    loadPosts();

    $scope.vote = function (post, type) {
        if (post.author.id == settings.user.id) {
            return;
        }
        post.userVote = type;
        if (type != 'like') {
            post.isGood = false;
        }
        post.$vote();
    }


    $scope.existsInterest = false;

    $scope.suggestions = {
        main: [],
        additional: [],
        parents: [],
        promises: {},
        getActive: function () {
            for (var i in this.main) {
                if (this.main[i].active) {
                    return this.main[i];
                }
            }
            return null;
        },
        pushParent: function (interest) {
            this.parents.push(interest);
            this.main = this.additional;
            this.additional = [];
            $scope.search.term = '';
        },
        popParent: function () {
            this.parents.pop();
            this.main = [];
            this.additional = [];
        },
        clear: function (parents) {
            this.main = [];
            this.additional = [];
            if (parents) {
                this.parents = [];
            }
        }
    };

    $scope.search = function () {
        $scope.suggestions.additional = [];
        if ($scope.search.term.length >= 3) {
            $scope.suggestions.promises = {};
            $scope.suggestions.main = Interest.search({term: $scope.search.term});

            Interest.exists({name: $scope.search.term}).$then(
                function (response) {
                    $scope.existsInterest = response.data == 'true';
                });
        }
        else {
            $scope.suggestions.main = [];
        }

    };

    $scope.search.term = '';

    $scope.showAdditionalSuggestions = function (parent) {
        if ($scope.suggestions.promises[parent.id]) {
            $timeout.cancel($scope.suggestions.promises[parent.id]);
        }

        _($scope.suggestions.main).each(function (i) {
            i.active = false;
        });
        parent.active = true;
        $scope.suggestions.additional = Interest.children({parentId: parent.id});
    };

    //$scope.d_showAdditionalSuggestions = _.debounce($scope.showAdditionalSuggestions, 300);

    $scope.toggleFilter = function (id) {
        loadPosts();
    };


    $scope.isFilterDisabled = function (id) {
        var filters = getFilters();
        return (filters.length > 2) && (_(filters).indexOf(id) == -1);
    };

    $scope.createInterest = function () {
        var i = new Interest;
        i.name = $scope.search.term;

        if ($scope.suggestions.parents.length) {
            i.parentId = _($scope.suggestions.parents).last().id;
        }
        i.$save(function (i) {
            $scope.interests.push(i);
        });
        $scope.search.term = '';
        $scope.suggestions.clear();
    };

    $scope.detachInterest = function (interest) {
        Interest.detach({id: interest.id});
        $scope.interests = _($scope.interests).without(interest);
        if (interest.checked) {
            loadPosts();
        }
    };

    $scope.attachInterest = function (interest) {
        Interest.attach({id: interest.id});
        _($scope.interests).each(function (i) {
            i.checked = false;
        });
        interest.checked = true;
        $scope.interests.push(interest);

        loadPosts();
    };

    $scope.getSearchWidth = function () {
        return 180;
    }

    $scope.hasInterest = function (interest) {
        for (var i = 0; i < $scope.interests.length; i++) {
            if ($scope.interests[i].id == interest.id) return true;
        }

        return false;
    };

    $scope.favorites = {};


    var prepareFavorites = function () {
        $scope.favorites = {};
        _(favoritePosts).each(function (post) {
            _(post.interests).each(
                function (interest) {
                    if (!(interest.id in $scope.favorites)) {
                        $scope.favorites[interest.id] = {
                            interest: interest,
                            posts: []
                        }
                    }
                    $scope.favorites[interest.id].posts.push(post);
                }
            );
        });
    };

    var favoritePosts = Post.favorites({}, prepareFavorites);

    $scope.toggleFavorite = function (post, add) {
        var i;

        add = add || true;

        post.isFavorite = !post.isFavorite;

        Post.toggleFavorite({id: post.id, value: post.isFavorite});


        if (add) {
            for (i = 0; i < favoritePosts.length; i++) {
                if (favoritePosts[i].id == post.id) {
                    return;
                }
            }
            favoritePosts.push(post);
            prepareFavorites();
        }
        else {
            for (i = 0; i < $scope.posts.length; i++) {
                if ($scope.posts[i].id == post.id) {
                    $scope.posts[i].isFavorite = post.isFavorite;
                }
            }
        }


    }


});