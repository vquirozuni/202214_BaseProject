/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { SupermercadoService } from './supermercado.service';
import { SupermercadoEntity } from './supermercado.entity';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';


describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repository: Repository<SupermercadoEntity>;
  let supermercadoList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    supermercadoList = [];
    for(let i = 0; i < 5; i++){
        const supermercado: SupermercadoEntity = await repository.save(
          {
            nombre: faker.company.name(),
            longitud: faker.address.longitude(),
            latitud: faker.address.latitude(),
            paginaWeb: faker.internet.url()
          }
        );        
        supermercadoList.push(supermercado);
    }
  }

  it('findAll debería devolver todas los supermercados', async () => {
    const supermercados: SupermercadoEntity[] = await service.findAll();
    expect(supermercados).not.toBeNull();
    expect(supermercados).toHaveLength(supermercadoList.length);
  });

  it('findOne debería retornar un supermercado por id', async () => {
    const storedSupermercado: SupermercadoEntity = supermercadoList[0];
    const supermercado: SupermercadoEntity = await service.findOne(storedSupermercado.id);
    expect(supermercado).not.toBeNull();
    expect(supermercado.nombre).toEqual(storedSupermercado.nombre)
    expect(supermercado.longitud).toEqual(storedSupermercado.longitud)
    expect(supermercado.latitud).toEqual(storedSupermercado.latitud)
    expect(supermercado.paginaWeb).toEqual(storedSupermercado.paginaWeb)
  });

  it('findOne debería lanzar una excepción para una supermercado inválido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontró el supermercado con el ID dado")
  });


  it('create debería retornar un nuevo supermercado con nombre válido', async () => {
    const supermercado: SupermercadoEntity = {
      id: "",
      nombre: "Supermercado Nuevo",
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaWeb: faker.internet.url(),
      ciudades: []
    }
 
    const nuevoSupermercado: SupermercadoEntity = await service.create(supermercado);
    expect(nuevoSupermercado).not.toBeNull();
 
    const storedSupermercado: SupermercadoEntity = await repository.findOne({where: {id: nuevoSupermercado.id}})
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toEqual(nuevoSupermercado.nombre)
    expect(storedSupermercado.longitud).toEqual(nuevoSupermercado.longitud)
    expect(storedSupermercado.latitud).toEqual(nuevoSupermercado.latitud)
    expect(storedSupermercado.paginaWeb).toEqual(nuevoSupermercado.paginaWeb)
  });  

  it('create debería lanzar una excepción por crear un nuevo supermercado con nombre no válido', async () => {
    const supermercado: SupermercadoEntity = {
      id: "",
      nombre: "Nuevo",
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      paginaWeb: faker.internet.url(),
      ciudades: []
    } 
    await expect(() => service.create(supermercado)).rejects.toHaveProperty("message", "El nombre del supermercado debe tener mas de 10 caracteres")
  });  

  
  it('update debería modificar un supermercado con nombre válido', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    supermercado.nombre = "Nuevo Nombre Supermercado";
    supermercado.longitud = faker.address.longitude();
    supermercado.latitud = faker.address.latitude();
    supermercado.paginaWeb = faker.internet.url();
    const updatedSupermercado: SupermercadoEntity = await service.update(supermercado.id, supermercado);
    expect(updatedSupermercado).not.toBeNull();
    const storedSupermercado: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } })
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toEqual(supermercado.nombre)
    expect(storedSupermercado.longitud).toEqual(supermercado.longitud)
    expect(storedSupermercado.latitud).toEqual(supermercado.latitud)
    expect(storedSupermercado.paginaWeb).toEqual(supermercado.paginaWeb)
  });


  it('update debería lanzar una excepción por modificar un supermercado con nombre no válido', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    supermercado.nombre = "Nuevo";
    supermercado.longitud = faker.address.longitude();
    supermercado.latitud = faker.address.latitude();
    supermercado.paginaWeb = faker.internet.url();
    await expect(() => service.update(supermercado.id, supermercado)).rejects.toHaveProperty("message", "El nombre del supermercado debe tener mas de 10 caracteres")
  });

  it('update debería lanzar una excepción por actualizar un supermercado que no existe', async () => {
    let supermercado: SupermercadoEntity = supermercadoList[0];
    supermercado = {
      ...supermercado, nombre: "Nuevo Nombre Supermercado", longitud: faker.address.longitude(), latitud: faker.address.latitude(), paginaWeb: faker.internet.url()
    }
    await expect(() => service.update("0", supermercado)).rejects.toHaveProperty("message", "No se encontró el supermercado con el ID dado")
  });

  it('delete deberia eliminar una supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    await service.delete(supermercado.id);
    const deletedSupermercado: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } })
    expect(deletedSupermercado).toBeNull();
  });

  it('delete debería lanzar una excepción por eliminar un supermercado que no existe', async () => {
    const supermercado: SupermercadoEntity = supermercadoList[0];
    await service.delete(supermercado.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontró el supermercado con el ID dado")
  });

  
});
