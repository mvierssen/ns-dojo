Introduce Result type for operations that can fail.

- [ ] parseStart has to return a Result<RoverState, Error>
  - [ ] use safeParse instead of parse
  - [ ] in case of an invalid input string, return an `error` with an appropriate error message
  - [ ] in case of a valid input string, return an `success` with the RoverState
- [*] run has to return a Result<RoverState, Error>
  - [*] use safeParse instead of parse
  - [*] modify reduce to reduce over mapped Result<RoverState, Error>
    - [*] modify step to take a Result<RoverState, Error> and return a Result<RoverState, Error>
- [*] render has to return a Result<PositionDirectionString, Error> in case an invalid state is passed during runtime
