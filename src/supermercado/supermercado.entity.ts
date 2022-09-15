/* eslint-disable prettier/prettier */
import { CiudadEntity } from "../ciudad/ciudad.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SupermercadoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;
    
    @Column()
    longitud: string;
    
    @Column()
    latitud: string;

    @Column()
    paginaWeb: string;

    @ManyToMany(() => CiudadEntity, ciudad => ciudad.supermercados)
    ciudades: CiudadEntity[];
}