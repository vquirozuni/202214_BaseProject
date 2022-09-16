/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CiudadService } from './ciudad.service';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('CiudadService', () => {
  let service: CiudadService;
  let repository: Repository<CiudadEntity>;
  let ciudadList: CiudadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    ciudadList = [];
    for(let i = 0; i < 5; i++){
        const ciudad: CiudadEntity = await repository.save(
          {
            nombre: faker.address.cityName(),
            pais: faker.address.country(),
            numeroDeHabitantes: parseInt(faker.random.numeric(6))
          }
        );        
        ciudadList.push(ciudad);
    }
  }

  it('findAll debería devolver todas las ciudades', async () => {
    const ciudades: CiudadEntity[] = await service.findAll();
    expect(ciudades).not.toBeNull();
    expect(ciudades).toHaveLength(ciudadList.length);
  });

  it('findOne debería retornar una ciudad por id', async () => {
    const storedCiudad: CiudadEntity = ciudadList[0];
    const ciudad: CiudadEntity = await service.findOne(storedCiudad.id);
    expect(ciudad).not.toBeNull();
    expect(ciudad.nombre).toEqual(storedCiudad.nombre)
    expect(ciudad.pais).toEqual(storedCiudad.pais)
    expect(ciudad.numeroDeHabitantes).toEqual(storedCiudad.numeroDeHabitantes)
  });

  it('findOne debería lanzar una excepción para una ciudad inválida', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontró la ciudad con el ID dado")
  });


  it('create debería retornar una nueva ciudad de un pais permitido', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      nombre: faker.address.cityName(),
      pais: "Argentina",
      numeroDeHabitantes: parseInt(faker.random.numeric(6)),
      supermercados: []
    }
 
    const nuevaCiudad: CiudadEntity = await service.create(ciudad);
    expect(nuevaCiudad).not.toBeNull();
 
    const storedCiudad: CiudadEntity = await repository.findOne({where: {id: nuevaCiudad.id}})
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.nombre).toEqual(nuevaCiudad.nombre)
    expect(storedCiudad.pais).toEqual(nuevaCiudad.pais)
    expect(storedCiudad.numeroDeHabitantes).toEqual(nuevaCiudad.numeroDeHabitantes)
  });  

  it('create debería lanzar una excepción por crear una nueva ciudad de un pais no permitido', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      nombre: faker.address.cityName(),
      pais: faker.address.country(),
      numeroDeHabitantes: parseInt(faker.random.numeric(6)),
      supermercados: []
    } 
    await expect(() => service.create(ciudad)).rejects.toHaveProperty("message", "El pais de la ciudad ingresada no se encuentra dentro de los paises permitidos")
  });  

  
  it('update debería modificar una ciudad con datos de un pais permitido', async () => {
    const ciudad: CiudadEntity = ciudadList[0];
    ciudad.nombre = faker.address.cityName();
    ciudad.pais = "Paraguay";
    ciudad.numeroDeHabitantes = parseInt(faker.random.numeric(6));
    const updatedCiudad: CiudadEntity = await service.update(ciudad.id, ciudad);
    expect(updatedCiudad).not.toBeNull();
     const storedCiudad: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } })
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.nombre).toEqual(ciudad.nombre)
    expect(storedCiudad.pais).toEqual(ciudad.pais)
    expect(storedCiudad.numeroDeHabitantes).toEqual(ciudad.numeroDeHabitantes)
  });


  it('update debería lanzar una excepción por modificar una ciudad con datos de un pais no permitido', async () => {
    const ciudad: CiudadEntity = ciudadList[0];
    ciudad.nombre = faker.address.cityName();
    ciudad.pais = faker.address.country();
    ciudad.numeroDeHabitantes = parseInt(faker.random.numeric(6));    
    await expect(() => service.update(ciudad.id, ciudad)).rejects.toHaveProperty("message", "El pais de la ciudad ingresada no se encuentra dentro de los paises permitidos")
  });

  it('update debería lanzar una excepción por actualizar una ciudad que no existe', async () => {
    let ciudad: CiudadEntity = ciudadList[0];
    ciudad = {
      ...ciudad, nombre: faker.address.cityName(), pais: "Argentina", numeroDeHabitantes: parseInt(faker.random.numeric(6))
    }
    await expect(() => service.update("0", ciudad)).rejects.toHaveProperty("message", "No se encontró la ciudad con el ID dado")
  });

  it('delete deberia eliminar una ciudad', async () => {
    const ciudad: CiudadEntity = ciudadList[0];
    await service.delete(ciudad.id);
    const deletedCiudad: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } })
    expect(deletedCiudad).toBeNull();
  });

  it('delete debería lanzar una excepción por eliminar una ciudad que no existe', async () => {
    const ciudad: CiudadEntity = ciudadList[0];
    await service.delete(ciudad.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontró la ciudad con el ID dado")
  });

});
