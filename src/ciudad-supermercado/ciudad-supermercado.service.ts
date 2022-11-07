/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class CiudadSupermercadoService {
    constructor(
        @InjectRepository(CiudadEntity)
        private readonly ciudadRepository: Repository<CiudadEntity>,
    
        @InjectRepository(SupermercadoEntity)
        private readonly supermercadoRepository: Repository<SupermercadoEntity>
    ) {}

    async addSupermarketToCity(ciudadId: string, supermercadoId: string): Promise<CiudadEntity> 
    {
        const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where: {id: supermercadoId}});
        
        if (!supermercado)
          throw new BusinessLogicException("No se encontró el Supermercado con el Id dado", BusinessError.NOT_FOUND);
      
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where: {id: ciudadId}, relations: ["supermercados"]})
        if (!ciudad)
          throw new BusinessLogicException("no se encontró la ciudad con el Id dado", BusinessError.NOT_FOUND);
    
        ciudad.supermercados = [...ciudad.supermercados, supermercado];
        return await this.ciudadRepository.save(ciudad);
    }

  async AgregarSupermercadoCiudad(ciudadId: string, supermercadoId: string): Promise<CiudadEntity> 
  {
    const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where: {id: supermercadoId}});
    
    if (!supermercado)
      throw new BusinessLogicException("No se encontró el Supermercado con el Id dado", BusinessError.NOT_FOUND);
  
    const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where: {id: ciudadId}, relations: ["supermercados"]})
    if (!ciudad)
      throw new BusinessLogicException("no se encontró la ciudad con el Id dado", BusinessError.NOT_FOUND);
    
    ciudad.supermercados = [...ciudad.supermercados, supermercado];
    return await this.ciudadRepository.save(ciudad);
  }

    async findSupermarketsFromCity(ciudadId: string): Promise<SupermercadoEntity[]> {
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where: {id: ciudadId}, relations: ["supermercados"]});
        if (!ciudad)
          throw new BusinessLogicException("No se encontró la ciudad con el Id dado", BusinessError.NOT_FOUND)  
        return ciudad.supermercados;
    }


    async BuscaSupermercadoDeCiudad(ciudadId: string): Promise<SupermercadoEntity[]> {
      const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where: {id: ciudadId}, relations: ["supermercados"]});
      if (!ciudad)
        throw new BusinessLogicException("No se encontró la ciudad con el Id dado", BusinessError.NOT_FOUND)  
      return ciudad.supermercados;
    }

    

    async findSupermarketFromCity(ciudadId: string, supermercadoId: string): Promise<SupermercadoEntity> {
        const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where: {id: supermercadoId}});
        if (!supermercado)
          throw new BusinessLogicException("No se encontró el Supermercado con el Id dado", BusinessError.NOT_FOUND)
       
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where: {id: ciudadId}, relations: ["supermercados"]});
        if (!ciudad)
          throw new BusinessLogicException("No se encontró la ciudad con el Id dado", BusinessError.NOT_FOUND)
   
        const ciudad_supermercado: SupermercadoEntity = ciudad.supermercados.find(s => s.id === supermercado.id);
   
        if (!ciudad_supermercado)
          throw new BusinessLogicException("El supermercado no se encuentra asociado a la ciudad", BusinessError.PRECONDITION_FAILED)
   
        return ciudad_supermercado;
    }

    async updateSupermarketsFromCity(ciudadId: string, supermercados: SupermercadoEntity[]): Promise<CiudadEntity> {
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where: {id: ciudadId}, relations: ["supermercados"]});
    
        if (!ciudad)
          throw new BusinessLogicException("No se encontró la ciudad con el Id dado", BusinessError.NOT_FOUND)
    
        for (let i = 0; i < supermercados.length; i++) {
          const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where: {id: supermercados[i].id}});
          if (!supermercado)
            throw new BusinessLogicException("No se encontró el supermercado con el Id dado", BusinessError.NOT_FOUND)
        }
    
        ciudad.supermercados = supermercados;
        return await this.ciudadRepository.save(ciudad);
      }

      async deleteSupermarketFromCity(ciudadId: string, supermercadoId: string){
        const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where: {id: supermercadoId}});
        if (!supermercado)
          throw new BusinessLogicException("No se encontró el supermercado con el Id dado", BusinessError.NOT_FOUND)
    
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where: {id: ciudadId}, relations: ["supermercados"]});
        if (!ciudad)
          throw new BusinessLogicException("No se encontró la ciudad con el Id dado", BusinessError.NOT_FOUND)
    
        const ciudadSupermercado: SupermercadoEntity = ciudad.supermercados.find(s => s.id === supermercado.id);
    
        if (!ciudadSupermercado)
            throw new BusinessLogicException("El supermercado no se encuentra asociado a la ciudad", BusinessError.PRECONDITION_FAILED)
 
        ciudad.supermercados = ciudad.supermercados.filter(s => s.id !== supermercadoId);
        await this.ciudadRepository.save(ciudad);
    }  
}
