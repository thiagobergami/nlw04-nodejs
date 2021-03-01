import { EntityRepository, Repository } from "typeorm";
import { Survey } from "../models/Survey";

@EntityRepository(Survey)
class SurveysReoisitory extends Repository<Survey> {

}

export { SurveysReoisitory }