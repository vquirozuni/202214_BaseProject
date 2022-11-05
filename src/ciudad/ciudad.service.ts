/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';

@Injectable()
export class CiudadService {
    constructor(
        @InjectRepository(CiudadEntity)
        private readonly ciudadRepository: Repository<CiudadEntity>
    ){}

    async findAll(): Promise<CiudadEntity[]> {
        return await this.ciudadRepository.find({ relations: ["supermercados"] });
    }

    async findOne(id: string): Promise<CiudadEntity> {
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where: {id}, relations: ["supermercados"] } );
        if (!ciudad)
          throw new BusinessLogicException("No se encontró la ciudad con el ID dado", BusinessError.NOT_FOUND);
   
        return ciudad;
    }

    async create(ciudad: CiudadEntity): Promise<CiudadEntity> {            
        if( !ValidaPais(ciudad.pais))
            throw new BusinessLogicException("El pais de la ciudad ingresada no se encuentra dentro de los paises permitidos", BusinessError.PRECONDITION_FAILED);
        return await this.ciudadRepository.save(ciudad);
    }

    async update(id: string, ciudad: CiudadEntity): Promise<CiudadEntity> {
        if( !ValidaPais(ciudad.pais))
            throw new BusinessLogicException("El pais de la ciudad ingresada no se encuentra dentro de los paises permitidos", BusinessError.PRECONDITION_FAILED);  

        const persistedCiudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id}});
        if (!persistedCiudad)
          throw new BusinessLogicException("No se encontró la ciudad con el ID dado", BusinessError.NOT_FOUND);
        
        return await this.ciudadRepository.save({...persistedCiudad, ...ciudad});
    }

    async delete(id: string) {
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id}});
        if (!ciudad)
          throw new BusinessLogicException("No se encontró la ciudad con el ID dado", BusinessError.NOT_FOUND);
      
        await this.ciudadRepository.remove(ciudad);
    }


}

function ValidaPais(pais: string) {
    const listaDePaises = ["ARGENTINA", "ECUADOR", "PARAGUAY"];
    return listaDePaises.includes(pais.toUpperCase());
}

