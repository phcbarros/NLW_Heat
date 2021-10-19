import {Request, Response} from 'express'

import {GetLast3MessageService} from '../services/GetLast3MessageService'

class GetLast3MessagesController {
  async handle(request: Request, response: Response) {
    const service = new GetLast3MessageService()

    try {
      const result = await service.execute()
      response.json(result)
    } catch (err) {
      response.json({error: err.message})
    }
  }
}

export {GetLast3MessagesController}
