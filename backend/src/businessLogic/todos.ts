import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

import * as uuid from 'uuid'

const todosAccess = new TodosAccess()
const s3_bucket = process.env.ATTACHMENT_S3_BUCKET
const AWS_REGION = process.env.AWS_REGION

export async function getTodosForUser(userId: string) {
    return await todosAccess.getTodosForUser(userId)
}

export async function createTodoForUser(userId: string, item: CreateTodoRequest) {
    const todoId = uuid.v4()
    return await todosAccess.createTodoForUser(userId, {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: item.name,
        dueDate: item.dueDate,
        done: false
    } )
}

export async function deleteTodo(userId: string, todoId: string) {
    return await todosAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(userId: string, todoId: string, newData: UpdateTodoRequest) {
    return await todosAccess.updateTodo(userId, todoId, newData)
}

export async function updateUrlForTodoItem(userId: string, todoId: string, attachmentId: string) {
    const todoItem = await todosAccess.getTodoForUserById(userId, todoId)
    const attachmentUrl  = `https://${s3_bucket}.s3.${AWS_REGION}.amazonaws.com/${attachmentId}`
    return await todosAccess.updateUrlForTodoItem(userId, todoId, {
        
            name: todoItem.name,
            dueDate: todoItem.dueDate,
            done: todoItem.done,
            attachmentUrl: attachmentUrl
        
    })
}