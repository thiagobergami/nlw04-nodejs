import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UserRepository } from "../repositories/UserRespository";
import { SurveysReoisitory } from "../repositories/SurveyRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import SendMailServices from "../services/SendMailServices";
import { resolve } from 'path';


class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UserRepository);
        const surveyRepository = getCustomRepository(SurveysReoisitory);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({ email });

        if (!user) {
            return response.status(400).json({
                error: "User does not exists",
            });
        }
        const survey = await surveyRepository.findOne({ id: survey_id })

        if (!survey) {
            return response.status(400).json({
                error: "Survey does not exists"
            })
        }

        const surveyUserAlredyExists = await surveysUsersRepository.findOne({
            where: { user_id: user.id, value: null },
            relations: ["user", "survey"],
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        if (surveyUserAlredyExists) {
            variables.id = surveyUserAlredyExists.id;
            await SendMailServices.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlredyExists)
        }

        //Salvar as informações na tabela
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id
        })

        await surveysUsersRepository.save(surveyUser);
        //Enviar e-mail para usuário

        variables.id = surveyUser.id;
        await SendMailServices.execute(email, survey.title, variables, npsPath)

        return response.json(surveyUser);
    }
}

export { SendMailController }