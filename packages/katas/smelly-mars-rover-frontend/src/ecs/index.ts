// Entity
export {createEntity, type EntityId} from "./entity.js";

// World
export {
  createWorld,
  addEntity,
  removeEntity,
  hasEntity,
  type World,
  type ComponentType,
} from "./world.js";

// Component
export {
  addComponent,
  getComponent,
  removeComponent,
  hasComponent,
} from "./component.js";

// Query
export {queryEntities} from "./query.js";
