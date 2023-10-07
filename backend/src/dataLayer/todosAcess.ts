import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
// import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require("aws-xray-sdk");

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly logger = createLogger('todos-access')) {
    }

    async getTodosForUser(userId:string):Promise<TodoItem[]>{
        const rs = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        this.logger.info(`Get list todos for user ${userId} success.`)

        const items = rs.Items
        return items as TodoItem[]
    }

    async getTodoForUserById(userId: string, todoId: string): Promise<TodoItem> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()

        const items = result.Items
        return items[0] as TodoItem
    }

    async createTodoForUser(userId:string, item: TodoItem):Promise<TodoItem>{
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        this.logger.info(`create todo for user ${userId} success.`)

        return item;
    }

    async deleteTodo(userId: string, todoId: string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: { userId, todoId }
        }).promise()
    }

    async updateTodo(userId: string, todoId: string, newTodo: UpdateTodoRequest){
        const current = this.getTodoForUserById(userId, todoId)

        if (!current) {
            throw new Error(`Todo ${todoId} not found`)
        }

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET #itemname = :itemname, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#itemname': 'name'
            },
            ExpressionAttributeValues: {
                ':itemname': newTodo.name,
                ':dueDate': newTodo.dueDate,
                ':done': newTodo.done
            }
        }).promise()
        
    }

    async updateUrlForTodoItem(userId: string, todoId: string, newData: UpdateTodoRequest) {
        const current = this.getTodoForUserById(userId, todoId)

        if (!current) {
            throw new Error(`Todo ${todoId} not found`)
        }

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': newData.attachmentUrl
            }
        }).promise()
    }
}