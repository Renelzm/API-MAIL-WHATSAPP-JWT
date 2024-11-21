import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Rol } from "./rol.entity";

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id_usuario: string;

  @Column()
  nombre: string;

  @Column({ default: 'Generico'})
  entidad?: string;

  @ManyToOne(() => Rol, rol => rol.usuarios)
  rol: Rol;

  @Column({ unique: true })
  correo: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;
}