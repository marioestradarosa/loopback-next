import {model, Entity, property, hasMany} from '@loopback/repository';
import {Todo} from './todo.model';

@model()
export class TodoList extends Entity {
  @property({id: true})
  id: number;
  @property() createdAt: Date;
  @hasMany(Todo) todos: Todo[];
}
