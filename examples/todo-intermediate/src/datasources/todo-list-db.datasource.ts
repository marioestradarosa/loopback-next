import {inject} from '@loopback/core';
import {juggler, DataSource, AnyObject} from '@loopback/repository';
const config = require('./todo-list-db.datasource.json');

export class TodoListDbDataSource extends juggler.DataSource {
  static dataSourceName = 'TodoListDb';

  constructor(
    @inject('datasources.config.TodoListDb', {optional: true})
    dsConfig: AnyObject = config
  ) {
    super(dsConfig);
  }
}
