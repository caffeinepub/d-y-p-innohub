import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type definitions
  type ProjectId = Nat;
  type CommentId = Nat;

  public type Project = {
    id : ProjectId;
    title : Text;
    description : Text;
    tags : [Text];
    category : Text;
    innovationSummary : Text;
    authorId : Principal;
    authorName : Text;
    fileBlobIds : [Text];
    likedBy : [Principal];
    commentCount : Nat;
    viewCount : Nat;
    createdAt : Int;
  };

  public type Comment = {
    id : CommentId;
    projectId : ProjectId;
    authorId : Principal;
    authorName : Text;
    text : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    principal : Principal;
    displayName : Text;
    bio : Text;
    projectCount : Nat;
    totalLikes : Nat;
  };

  // Stable storage for persistence across upgrades
  stable var stableNextProjectId : Nat = 1;
  stable var stableNextCommentId : Nat = 1;
  stable var stableProjects : [(ProjectId, Project)] = [];
  stable var stableComments : [(CommentId, Comment)] = [];
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];

  // In-memory working maps
  var nextProjectId = stableNextProjectId;
  var nextCommentId = stableNextCommentId;

  let projects = Map.empty<ProjectId, Project>();
  let comments = Map.empty<CommentId, Comment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Restore data from stable storage on startup
  do {
    for ((k, v) in stableProjects.vals()) {
      projects.add(k, v);
    };
    for ((k, v) in stableComments.vals()) {
      comments.add(k, v);
    };
    for ((k, v) in stableUserProfiles.vals()) {
      userProfiles.add(k, v);
    };
  };

  // Save data to stable storage before upgrade
  system func preupgrade() {
    stableNextProjectId := nextProjectId;
    stableNextCommentId := nextCommentId;
    stableProjects := projects.entries().toArray();
    stableComments := comments.entries().toArray();
    stableUserProfiles := userProfiles.entries().toArray();
  };

  // Project Management
  public shared ({ caller }) func createProject(title : Text, description : Text, tags : [Text], category : Text, innovationSummary : Text, fileBlobIds : [Text], authorName : Text) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    let project : Project = {
      id = nextProjectId;
      title;
      description;
      tags;
      category;
      innovationSummary;
      authorId = caller;
      authorName;
      fileBlobIds;
      likedBy = [];
      commentCount = 0;
      viewCount = 0;
      createdAt = Time.now();
    };

    projects.add(nextProjectId, project);
    updateProjectCount(caller);

    nextProjectId += 1;
    project;
  };

  public shared ({ caller }) func likeProject(id : ProjectId) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like projects");
    };

    let project = getProjectByIdInternal(id);

    if (project.likedBy.values().contains(caller)) {
      Runtime.trap("Already liked this project");
    };

    let updatedLikedBy = project.likedBy.concat([caller]);
    let updatedProject = { project with likedBy = updatedLikedBy };
    projects.add(id, updatedProject);

    updateProjectLikes(project.authorId);
    updatedLikedBy.size();
  };

  public shared ({ caller }) func addComment(projectId : ProjectId, text : Text, authorName : Text) : async Comment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    if (text == "" or authorName == "") {
      Runtime.trap("Missing required fields");
    };

    ignore getProjectByIdInternal(projectId);

    let comment : Comment = {
      id = nextCommentId;
      projectId;
      authorId = caller;
      authorName;
      text;
      createdAt = Time.now();
    };

    comments.add(nextCommentId, comment);
    updateProjectCommentCount(projectId);

    nextCommentId += 1;
    comment;
  };

  public shared ({ caller }) func recordProjectView(id : ProjectId) : async () {
    let project = getProjectByIdInternal(id);
    projects.add(id, { project with viewCount = project.viewCount + 1 });
  };

  // Data retrieval
  public query ({ caller }) func getProjects(category : ?Text, searchQuery : ?Text) : async [Project] {
    projects.values().filter(func(p) { true }).toArray();
  };

  public query ({ caller }) func getProject(id : ProjectId) : async Project {
    getProjectByIdInternal(id);
  };

  public query ({ caller }) func getProjectComments(projectId : ProjectId) : async [Comment] {
    comments.values().filter(func(c) { c.projectId == projectId }).toArray();
  };

  public query ({ caller }) func getUserProjects(userId : Principal) : async [Project] {
    projects.values().filter(func(p) { p.authorId == userId }).toArray();
  };

  public query ({ caller }) func getRecentActivity() : async {
    projects : [Project];
    comments : [Comment];
  } {
    {
      projects = projects.values().toArray().sliceToArray(0, 10);
      comments = comments.values().toArray().sliceToArray(0, 10);
    };
  };

  public query ({ caller }) func getTopContributors() : async [UserProfile] {
    userProfiles.values().toArray();
  };

  // User Profiles
  public shared ({ caller }) func updateUserProfile(displayName : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    if (displayName == "") { Runtime.trap("Display name is required") };
    let existingProfile = switch (userProfiles.get(caller)) {
      case (null) {
        {
          principal = caller;
          displayName;
          bio;
          projectCount = 0;
          totalLikes = 0;
        };
      };
      case (?profile) {
        { profile with displayName; bio };
      };
    };

    userProfiles.add(caller, existingProfile);
  };

  public query ({ caller }) func getUserProfile(userId : Principal) : async UserProfile {
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper Functions
  func getProjectByIdInternal(id : ProjectId) : Project {
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) { project };
    };
  };

  func updateProjectCount(userId : Principal) {
    let currentCount = switch (userProfiles.get(userId)) {
      case (null) { 1 };
      case (?profile) { profile.projectCount + 1 };
    };

    let updatedProfile = switch (userProfiles.get(userId)) {
      case (null) {
        {
          principal = userId;
          displayName = "";
          bio = "";
          projectCount = currentCount;
          totalLikes = 0;
        };
      };
      case (?profile) {
        { profile with projectCount = currentCount };
      };
    };

    userProfiles.add(userId, updatedProfile);
  };

  func updateProjectCommentCount(projectId : ProjectId) {
    let project = getProjectByIdInternal(projectId);
    projects.add(projectId, { project with commentCount = project.commentCount + 1 });
  };

  func updateProjectLikes(userId : Principal) {
    let totalLikes = projects.values().filter(func(p) { p.authorId == userId }).foldLeft(0, func(acc, p) { acc + p.likedBy.size() });
    let updatedProfile = switch (userProfiles.get(userId)) {
      case (null) {
        {
          principal = userId;
          displayName = "";
          bio = "";
          projectCount = 0;
          totalLikes;
        };
      };
      case (?profile) {
        { profile with totalLikes };
      };
    };

    userProfiles.add(userId, updatedProfile);
  };
};
