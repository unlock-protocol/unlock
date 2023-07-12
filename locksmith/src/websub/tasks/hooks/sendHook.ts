import { Task } from 'graphile-worker'

export const sendHook: Task = async () => {
  console.log('send hook')
}
