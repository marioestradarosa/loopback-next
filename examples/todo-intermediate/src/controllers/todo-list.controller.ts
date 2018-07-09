import {repository, HasManyRepository} from '@loopback/repository';
import {TodoListRepository} from '../repositories';
import {TodoList, Todo} from '../models';
import {requestBody, param, post, get, del, put, patch} from '@loopback/rest';

export class TodoListController {
  protected todoRepo: HasManyRepository<TodoList>;

  constructor(
    @repository(TodoListRepository) protected todoListRepo: TodoListRepository,
  ) {}

  @post('/todo-lists')
  async createTodoList() {
    const newTodoList = {createdAt: new Date()};
    return await this.todoListRepo.create(newTodoList);
  }

  @get('/todo-lists/{id}')
  async findTodoListById(@param.path.number('id') id: number) {
    return await this.todoListRepo.findById(id);
  }

  @get('/todo-lists')
  async findTodos() {
    return await this.todoListRepo.find();
  }

  @put('/todo-lists/{id}')
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todoList: TodoList,
  ) {
    return await this.todoListRepo.replaceById(id, todoList);
  }

  @patch('/todo-lists/{id}')
  async updateTodo(
    @param.path.number('id') id: number,
    @requestBody() todoList: TodoList,
  ) {
    return await this.todoListRepo.updateById(id, todoList);
  }

  @del('/todo-lists/{id}')
  async deleteTodo(@param.path.number('id') id: number) {
    return await this.todoListRepo.deleteById(id);
  }

  @post('/todo-lists/{id}/todos')
  async createTodoForTodoList(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ) {
    return await this.todoListRepo.todos(id).create(todo);
  }

  @get('/todo-lists/{id}/todos')
  async findTodosOfTodoList(@param.path.number('id') id: number) {
    return await this.todoListRepo.todos(id).find();
  }

  @del('/todo-lists/{id}/todos')
  async deleteTodosOfTodoList(@param.path.number('id') id: number) {
    return await this.todoListRepo.todos(id).delete();
  }
}
