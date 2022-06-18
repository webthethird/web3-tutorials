// SPDX-License-Identifier: MIT
import "./SimpleStorage.sol";

pragma solidity ^0.8.7;

contract StorageFactory {
  SimpleStorage[] public simpleStorageList;

  function createSimpleStorage() public {
    SimpleStorage simpleStorage = new SimpleStorage();
    simpleStorageList.push(simpleStorage);
  }

  function sfStoreNumber(
    uint256 _simpleStorageIndex,
    uint256 _simpleStorageNumber
  ) public {
    SimpleStorage simpleStorage = simpleStorageList[_simpleStorageIndex];
    simpleStorage.store(_simpleStorageNumber);
  }

  function sfGetNumber(uint256 _simpleStorageIndex)
    public
    view
    returns (uint256 _favoriteNumber)
  {
    SimpleStorage simpleStorage = simpleStorageList[_simpleStorageIndex];
    _favoriteNumber = simpleStorage.retrieve();
  }

  function sfGetNumber(
    uint256 _simpleStorageIndex,
    string memory _firstName,
    string memory _lastName
  ) public view returns (uint256 _favoriteNumber) {
    SimpleStorage simpleStorage = simpleStorageList[_simpleStorageIndex];
    SimpleStorage.Person memory _person = simpleStorage.nameToPerson(
      _firstName,
      _lastName
    );
    return _person.favoriteNumber;
  }

  function sfStorePerson(
    uint256 _simpleStorageIndex,
    string memory _firstName,
    string memory _lastName,
    uint256 _favoriteNumber
  ) public {
    SimpleStorage simpleStorage = simpleStorageList[_simpleStorageIndex];
    simpleStorage.addPerson(_firstName, _lastName, _favoriteNumber);
  }

  function sfGetPerson(uint256 _simpleStorageIndex, uint256 _personIndex)
    public
    view
    returns (SimpleStorage.Person memory)
  {
    SimpleStorage simpleStorage = simpleStorageList[_simpleStorageIndex];
    SimpleStorage.Person memory _person = simpleStorage.retrievePerson(
      _personIndex
    );
    return _person;
  }

  function sfGetPerson(
    uint256 _simpleStorageIndex,
    string memory _firstName,
    string memory _lastName
  ) public view returns (SimpleStorage.Person memory _person) {
    _person = simpleStorageList[_simpleStorageIndex].nameToPerson(
      _firstName,
      _lastName
    );
  }
}
