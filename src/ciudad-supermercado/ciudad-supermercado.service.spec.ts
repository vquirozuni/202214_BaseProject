/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';


describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let supermercadoRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadoList : SupermercadoEntity[];
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    supermercadoRepository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));
    ciudadRepository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    
    await seedDatabase();
  });

  const seedDatabase = async () => {
    supermercadoRepository.clear();
    ciudadRepository.clear();
 
    supermercadoList = [];
    for(let i = 0; i < 5; i++){
        const supermercado: SupermercadoEntity = await supermercadoRepository.save({
          nombre: "Nombre Supermercado " + i,
          longitud: faker.address.longitude(),
          latitud: faker.address.latitude(),
          paginaWeb: faker.internet.url()
        })
        supermercadoList.push(supermercado);
    }
 
    ciudad = await ciudadRepository.save({
      nombre: faker.address.cityName(),
      pais: "Argentina",
      numeroDeHabitantes: parseInt(faker.random.numeric(6)),
      supermercados: supermercadoList
    })
  }


  it('addSupermarketToCity deberia agregar un supermercado a una ciudad', async () => {
    const nuevoSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Otro Supermercado",
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaWeb: faker.internet.url()
    });
 
    const nuevaCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.address.cityName(),
      pais: "Ecuador",
      numeroDeHabitantes: parseInt(faker.random.numeric(6)),
    })
 
    const result: CiudadEntity = await service.addSupermarketToCity(nuevaCiudad.id, nuevoSupermercado.id);
   
    expect(result.supermercados.length).toBe(1);
    expect(result.supermercados[0]).not.toBeNull();
    expect(result.supermercados[0].nombre).toBe(nuevoSupermercado.nombre)
    expect(result.supermercados[0].longitud).toBe(nuevoSupermercado.longitud)
    expect(result.supermercados[0].latitud).toBe(nuevoSupermercado.latitud)
    expect(result.supermercados[0].paginaWeb).toBe(nuevoSupermercado.paginaWeb)
  });

  it('addSupermarketToCity debería lanzar una excepción por supermercado inválido', async () => {
    const nuevaCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.address.cityName(),
      pais: "Ecuador",
      numeroDeHabitantes: parseInt(faker.random.numeric(6)),
    })
 
    await expect(() => service.addSupermarketToCity(nuevaCiudad.id, "0")).rejects.toHaveProperty("message", "No se encontró el Supermercado con el Id dado");
  });

  it('addSupermarketToCity debería lanzar una excepción por ciudad inválida', async () => {
    const nuevoSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Otro Supermercado",
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaWeb: faker.internet.url()
    });
 
    await expect(() => service.addSupermarketToCity("0", nuevoSupermercado.id)).rejects.toHaveProperty("message", "no se encontró la ciudad con el Id dado");
  });

  it('findSupermarketsFromCity debería retornar los supermercados de una ciudad', async ()=>{
    const supermercados: SupermercadoEntity[] = await service.findSupermarketsFromCity(ciudad.id);
    expect(supermercados.length).toBe(5)
  });

  it('findSupermarketsFromCity debería lanzar una excepción por ciudad inválida', async () => {
    await expect(()=> service.findSupermarketsFromCity("0")).rejects.toHaveProperty("message", "No se encontró la ciudad con el Id dado");
  });

  it('findSupermarketFromCity debería retornar un supermercado de una ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    const storedSupermercado: SupermercadoEntity = await service.findSupermarketFromCity(ciudad.id, supermercado.id, )
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toBe(supermercado.nombre);
    expect(storedSupermercado.longitud).toBe(supermercado.longitud);
    expect(storedSupermercado.latitud).toBe(supermercado.latitud);
    expect(storedSupermercado.paginaWeb).toBe(supermercado.paginaWeb);
  });

  it('findSupermarketFromCity debería lanzar una excepción por supermercado inválido', async () => {
    await expect(()=> service.findSupermarketFromCity(ciudad.id, "0")).rejects.toHaveProperty("message", "No se encontró el Supermercado con el Id dado");
  });
  
  it('findSupermarketFromCity debería lanzar una excepción por ciudad inválida', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    await expect(()=> service.findSupermarketFromCity("0", supermercado.id)).rejects.toHaveProperty("message", "No se encontró la ciudad con el Id dado");
  });

  it('findSupermarketFromCity debería lanzar una excepción por supermercado no asociado a ciudad', async () => {
    const nuevoSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Otro Supermercado",
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaWeb: faker.internet.url()
    });
 
    await expect(()=> service.findSupermarketFromCity(ciudad.id, nuevoSupermercado.id)).rejects.toHaveProperty("message", "El supermercado no se encuentra asociado a la ciudad");
  });

  it('updateSupermarketsFromCity debería actualizar la lista de supermercados de una ciudad', async () => {
    const nuevoSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Otro Supermercado",
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaWeb: faker.internet.url()
    });
 
    const updatedCiudad: CiudadEntity = await service.updateSupermarketsFromCity(ciudad.id, [nuevoSupermercado]);
    expect(updatedCiudad.supermercados.length).toBe(1);
 
    expect(updatedCiudad.supermercados[0].nombre).toBe(nuevoSupermercado.nombre);
    expect(updatedCiudad.supermercados[0].longitud).toBe(nuevoSupermercado.longitud);
    expect(updatedCiudad.supermercados[0].latitud).toBe(nuevoSupermercado.latitud);
    expect(updatedCiudad.supermercados[0].paginaWeb).toBe(nuevoSupermercado.paginaWeb);
  });

  it('updateSupermarketsFromCity debería lanzar una excepción al asociar una lista de supermercados a una ciudad que no existe', async () => {
    const nuevoSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Otro Supermercado",
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaWeb: faker.internet.url()
    });
 
    await expect(()=> service.updateSupermarketsFromCity("0", [nuevoSupermercado])).rejects.toHaveProperty("message", "No se encontró la ciudad con el Id dado");
  });

  it('updateSupermarketsFromCity debería lanzar una excepción al asociar una lista de supermercados que no existe a una ciudad', async () => {
    const nuevoSupermercado: SupermercadoEntity = supermercadoList[0];
    nuevoSupermercado.id = "0";
 
    await expect(()=> service.updateSupermarketsFromCity(ciudad.id, [nuevoSupermercado])).rejects.toHaveProperty("message", "No se encontró el supermercado con el Id dado");
  });

  it('deleteSupermarketFromCity debería eliminar un supermercado de una ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
   
    await service.deleteSupermarketFromCity(ciudad.id, supermercado.id);
 
    const storedCiudad: CiudadEntity = await ciudadRepository.findOne({where: {id: ciudad.id}, relations: ["supermercados"]});
    const deletedSupermercado: SupermercadoEntity = storedCiudad.supermercados.find(s => s.id === supermercado.id);
 
    expect(deletedSupermercado).toBeUndefined();
 
  });

  it('deleteSupermarketFromCity debería lanzar una excepción por supermercado no existe', async () => {
    await expect(()=> service.deleteSupermarketFromCity(ciudad.id, "0")).rejects.toHaveProperty("message", "No se encontró el supermercado con el Id dado");
  });

  it('deleteSupermarketFromCity debería lanzar una excepción por ciudad no existe', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    await expect(()=> service.deleteSupermarketFromCity("0", supermercado.id)).rejects.toHaveProperty("message", "No se encontró la ciudad con el Id dado");
  });

  it('deleteSupermarketFromCity should thrown an exception for an non asocciated artwork', async () => {
    const nuevoSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Otro Supermercado",
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaWeb: faker.internet.url()
    });
 
    await expect(()=> service.deleteSupermarketFromCity(ciudad.id, nuevoSupermercado.id)).rejects.toHaveProperty("message", "El supermercado no se encuentra asociado a la ciudad");
  });

});
