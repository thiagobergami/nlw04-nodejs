import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../repositories/UserRespository';
import * as yup from 'yup'

class UserController {

    async create(request: Request, response: Response) {
        const { name, email } = request.body;

        const schema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().email().required()
        })

        if (!(await schema.isValid(request.body))) {
            return response.status(400).json({
                error: "Validation faild"
            })
        }

        const usersRepository = getCustomRepository(UserRepository);

        const userAlredyExists = await usersRepository.findOne({
            email
        });
        if (userAlredyExists) {
            return response.status(400).json({
                error: "User alredy exists!",
            })
        }

        const user = usersRepository.create({
            name, email
        });

        await usersRepository.save(user);

        return response.status(201).json(user);
    }
}
export { UserController };

