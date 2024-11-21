import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./user.entity";



@Entity()
export class Rol {

@PrimaryGeneratedColumn('uuid')
id_rol: string;

@Column('text')
nombre_rol: string;

@OneToMany(() => Usuario, usuario => usuario.rol)
usuarios: Usuario[]

}