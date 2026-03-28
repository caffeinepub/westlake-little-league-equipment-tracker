import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type EquipmentCategory = {
    #helmet;
    #catchersHelmet;
    #catchersGlove;
    #shinGuards;
    #chestPlate;
    #bat;
    #baseball;
    #softball;
    #glove;
    #equipmentBag;
    #tee;
    #other;
  };

  type Sport = {
    #baseball;
    #softball;
  };

  type EquipmentCondition = {
    #good;
    #fair;
    #damaged;
  };

  type RecipientType = {
    #team;
    #coach;
  };

  type EquipmentItem = {
    id : Nat;
    name : Text;
    category : EquipmentCategory;
    sport : Sport;
    condition : EquipmentCondition;
    totalQuantity : Nat;
    availableQuantity : Nat;
    notes : Text;
  };

  type Issuance = {
    id : Nat;
    equipmentItemId : Nat;
    quantityIssued : Nat;
    recipientName : Text;
    recipientType : RecipientType;
    recipientPhone : Text;
    recipientEmail : Text;
    issueDate : Int;
    returnDate : ?Int;
    returnCondition : ?EquipmentCondition;
    isReturned : Bool;
    notes : Text;
  };

  type User = {
    id : Nat;
    name : Text;
    email : Text;
    passwordHash : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    equipmentItems : Map.Map<Nat, EquipmentItem>;
    issuances : Map.Map<Nat, Issuance>;
    nextEquipmentId : Nat;
    nextIssuanceId : Nat;
  };

  type NewActor = {
    equipmentItems : Map.Map<Nat, EquipmentItem>;
    issuances : Map.Map<Nat, Issuance>;
    nextEquipmentId : Nat;
    nextIssuanceId : Nat;
    nextUserId : Nat;
    users : Map.Map<Nat, User>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextUserId = 1;
      users = Map.empty<Nat, User>();
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};
