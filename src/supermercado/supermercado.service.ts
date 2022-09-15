/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from './supermercado.entity';

@Injectable()
export class SupermercadoService {
    constructor(
        @InjectRepository(SupermercadoEntity)
        private readonly supermercadoRepository: Repository<SupermercadoEntity>
    ){}

    async findAll(): Promise<SupermercadoEntity[]> {
        return await this.supermercadoRepository.find({ relations: ["ciudades"] });
    }

    async findOne(id: string): Promise<SupermercadoEntity> {
        const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where: {id}, relations: ["ciudades"] } );
        if (!supermercado)
          throw new BusinessLogicException("No se encontró el supermercado con el ID dado", BusinessError.NOT_FOUND);
   
        return supermercado;
    }

    async create(supermercado: SupermercadoEntity): Promise<SupermercadoEntity> {            
        if( !ValidaSupermercado(supermercado.nombre))
            throw new BusinessLogicException("El nombre del supermercado debe tener mas de 10 caracteres", BusinessError.NOT_FOUND);  
        return await this.supermercadoRepository.save(supermercado);
    }

    async update(id: string, supermercado: SupermercadoEntity): Promise<SupermercadoEntity> {
        if( !ValidaSupermercado(supermercado.nombre))
            throw new BusinessLogicException("El nombre del supermercado debe tener mas de 10 caracteres", BusinessError.NOT_FOUND);  

        const persistedSupermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where:{id}});
        if (!persistedSupermercado)
          throw new BusinessLogicException("No se encontró el supermercado con el ID dado", BusinessError.NOT_FOUND);
        
        return await this.supermercadoRepository.save({...persistedSupermercado, ...supermercado});
    }

    async delete(id: string) {
        const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where:{id}});
        if (!supermercado)
          throw new BusinessLogicException("No se encontró el supermercado con el ID dado", BusinessError.NOT_FOUND);
      
        await this.supermercadoRepository.remove(supermercado);
    }
}

function ValidaSupermercado(nombre: string) {    
    return nombre.length > 10;
}
