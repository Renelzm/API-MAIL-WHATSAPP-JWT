import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateSeedDto } from './dto/create-seed.dto';

import { Usuario } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from 'src/auth/entities/rol.entity';

@Injectable()
export class SeedService {

  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createSeedDto: CreateSeedDto) {

    
    let  rol = await this.rolRepository.findOneBy({ nombre_rol: "admin" });
    if (!rol) {
      rol = this.rolRepository.create({nombre_rol: "admin"});
      await this.rolRepository.save(rol);
      console.log(rol);
    }
  const findAdminUser = await this.userRepository
  .createQueryBuilder('usuario')
  .innerJoinAndSelect('usuario.rol', 'rol')  // Hacer join con la tabla relacionada
  .where('rol.nombre_rol = :rol', { rol: 'admin' })  // Filtrar por el rol
  .getOne();

  if (!findAdminUser) {
    try {
      const { password, ...rest} = createSeedDto;
      const passwordHash = bcrypt.hashSync(password, 10);
      const crearAdministrador = this.userRepository.create({...rest, password: passwordHash, rol});
      await this.userRepository.save(crearAdministrador)
      return 'Administrador creado con exito';
    } catch (error) {
      throw new  BadRequestException('Error al crear el usuario', error.detail);
    }
   
  }

    return 'El administrador ya existe';
  }

}
