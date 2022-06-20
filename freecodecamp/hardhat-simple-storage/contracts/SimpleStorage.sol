// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7; // Latest is 0.8.14

contract SimpleStorage {
  uint256 favoriteNumber;

  struct Person {
    // strings are really just a subset of bytes32
    // but casting between string memory and bytes not allowed
    string firstName;
    string lastName;
    uint256 favoriteNumber;
  }
  // uint256[] public anArray;
  Person[] public people;

  mapping(string => mapping(string => Person)) private _nameToPerson;

  function store(uint256 _favoriteNumber) public {
    favoriteNumber = _favoriteNumber;
  }

  function retrieve() public view returns (uint256) {
    return favoriteNumber;
  }

  // Six places the EVM can access & store data:
  // Data location can only be specified for array, struct or mapping types
  //                                        (a string is an array of bytes)
  //            * - most important
  // - Stack
  // - Memory*    - only exists temporarily
  // - Storage*   - default for globally defined variables
  // - Calldata*  - only exists temporarily & cannot be modified
  // - Code
  // - Logs

  function nameToFavoriteNumber(
    string calldata _firstName,
    string calldata _lastName
  ) public view returns (uint256 _favoriteNumber) {
    _favoriteNumber = _nameToPerson[_lastName][_firstName].favoriteNumber;
  }

  function changePersonsFavoriteNumber(
    string calldata _firstName,
    string calldata _lastName,
    uint256 _newNumber
  ) public {
    _nameToPerson[_lastName][_firstName].favoriteNumber = _newNumber;
  }

  function nameToPerson(string memory _firstName, string memory _lastName)
    public
    view
    returns (Person memory _person)
  {
    _person = _nameToPerson[_lastName][_firstName];
  }

  function addPerson(
    string memory _firstName,
    string memory _lastName,
    uint256 _favoriteNumber
  ) public {
    Person memory person = Person(_firstName, _lastName, _favoriteNumber);
    people.push(person);
    _nameToPerson[_lastName][_firstName] = person;
  }

  function retrievePerson(uint256 _index)
    public
    view
    returns (Person memory _person)
  {
    _person = people[_index];
  }
}
