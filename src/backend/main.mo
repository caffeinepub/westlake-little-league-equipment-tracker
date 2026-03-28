import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import List "mo:core/List";
import Text "mo:core/Text";

actor {
  public type EquipmentCategory = {
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

  public type Sport = {
    #baseball;
    #softball;
  };

  public type EquipmentCondition = {
    #good;
    #fair;
    #damaged;
  };

  public type RecipientType = {
    #team;
    #coach;
  };

  public type EquipmentItem = {
    id : Nat;
    name : Text;
    category : EquipmentCategory;
    sport : Sport;
    condition : EquipmentCondition;
    totalQuantity : Nat;
    availableQuantity : Nat;
    notes : Text;
  };

  public type Issuance = {
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

  module EquipmentItem {
    public func compare(item1 : EquipmentItem, item2 : EquipmentItem) : Order.Order {
      Nat.compare(item1.id, item2.id);
    };
  };

  var nextEquipmentId = 1;
  var nextIssuanceId = 1;

  let equipmentItems = Map.empty<Nat, EquipmentItem>();
  let issuances = Map.empty<Nat, Issuance>();

  public shared ({ caller }) func addEquipmentItem(item : EquipmentItem) : async EquipmentItem {
    let newItem : EquipmentItem = {
      item with
      id = nextEquipmentId;
    };
    equipmentItems.add(nextEquipmentId, newItem);
    nextEquipmentId += 1;
    newItem;
  };

  public shared ({ caller }) func updateEquipmentItem(id : Nat, item : EquipmentItem) : async EquipmentItem {
    if (not equipmentItems.containsKey(id)) {
      Runtime.trap("Equipment item not found - could not update item");
    };
    let updatedItem : EquipmentItem = {
      item with
      id;
    };
    equipmentItems.add(id, updatedItem);
    updatedItem;
  };

  public shared ({ caller }) func deleteEquipmentItem(id : Nat) : async () {
    if (not equipmentItems.containsKey(id)) {
      Runtime.trap("Equipment item not found - could not delete");
    };
    equipmentItems.remove(id);
  };

  public shared ({ caller }) func createIssuance(issuance : Issuance) : async Issuance {
    let equipmentItem = switch (equipmentItems.get(issuance.equipmentItemId)) {
      case (null) { Runtime.trap("Equipment item not found - could not issue") };
      case (?item) { item };
    };

    if (issuance.quantityIssued > equipmentItem.availableQuantity) {
      Runtime.trap("Not enough available quantity to issue");
    };

    let updatedItem : EquipmentItem = {
      equipmentItem with
      availableQuantity = equipmentItem.availableQuantity - issuance.quantityIssued;
    };
    equipmentItems.add(issuance.equipmentItemId, updatedItem);

    let newIssuance : Issuance = {
      issuance with
      id = nextIssuanceId;
      issueDate = Time.now();
      isReturned = false;
    };
    issuances.add(nextIssuanceId, newIssuance);
    nextIssuanceId += 1;
    newIssuance;
  };

  public shared ({ caller }) func markAsReturned(issuanceId : Nat, returnCondition : EquipmentCondition) : async Issuance {
    let issuance = switch (issuances.get(issuanceId)) {
      case (null) { Runtime.trap("Issuance record not found - could not mark as returned") };
      case (?issuance) { issuance };
    };

    if (issuance.isReturned) {
      Runtime.trap("Issuance already marked as returned");
    };

    let equipmentItem = switch (equipmentItems.get(issuance.equipmentItemId)) {
      case (null) { Runtime.trap("Equipment item not found - could not update quantity") };
      case (?item) { item };
    };

    let updatedItem : EquipmentItem = {
      equipmentItem with
      availableQuantity = equipmentItem.availableQuantity + issuance.quantityIssued;
    };
    equipmentItems.add(issuance.equipmentItemId, updatedItem);

    let updatedIssuance : Issuance = {
      issuance with
      isReturned = true;
      returnDate = ?Time.now();
      returnCondition = ?returnCondition;
    };
    issuances.add(issuanceId, updatedIssuance);
    updatedIssuance;
  };

  public query ({ caller }) func getEquipmentItem(id : Nat) : async EquipmentItem {
    switch (equipmentItems.get(id)) {
      case (null) { Runtime.trap("Equipment item not found") };
      case (?item) { item };
    };
  };

  public query ({ caller }) func getAllEquipmentItems(sport : ?Sport) : async [EquipmentItem] {
    equipmentItems.values().filter(
      func(item) {
        switch (sport) {
          case (null) { true };
          case (?s) { item.sport == s };
        };
      }
    ).toArray().sort();
  };

  public query ({ caller }) func getActiveIssuances() : async [Issuance] {
    issuances.values().filter(
      func(issuance) { not issuance.isReturned }
    ).toArray().sort(Issuance.compareById);
  };

  public query ({ caller }) func getIssuancesByRecipient(recipientName : Text) : async [Issuance] {
    issuances.values().filter(
      func(issuance) { issuance.recipientName == recipientName }
    ).toArray().sort(Issuance.compareById);
  };

  public query ({ caller }) func getIssuanceHistoryForItem(equipmentItemId : Nat) : async [Issuance] {
    issuances.values().filter(
      func(issuance) { issuance.equipmentItemId == equipmentItemId }
    ).toArray().sort(Issuance.compareById);
  };

  module Issuance {
    public func compareById(issuance1 : Issuance, issuance2 : Issuance) : Order.Order {
      Nat.compare(issuance1.id, issuance2.id);
    };
  };
};
