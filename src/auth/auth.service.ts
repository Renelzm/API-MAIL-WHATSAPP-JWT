import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateRolDto, CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/user.entity';
import { Rol } from './entities/rol.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    private readonly jwtService: JwtService,

  ) { }


  async create(createUserDto: CreateUserDto) {

    try {
      const { rol, password, ...rest } = createUserDto;
     
      const rolEncontrado = await this.rolRepository.findOneBy({ nombre_rol: rol });
      if (!rolEncontrado) {
        throw new NotFoundException('Rol no encontrado');
      }
      const passwordHash = bcrypt.hashSync( password, 10 )

      const usuario = this.userRepository.create( {...rest, password: passwordHash, rol: rolEncontrado});
      await this.userRepository.save(usuario);
      delete usuario.password;
      return {...usuario, token: this.getJwtToken({id: usuario.id_usuario})};
    

    } catch (error) {
    
      throw new  BadRequestException('Error al crear el usuario', error.detail);
    }
  }

  async createRol(createRolDto: CreateRolDto) {
    const rol = await this.rolRepository.findOneBy({ nombre_rol: createRolDto.nombre_rol });
    if (rol) {
      throw new ConflictException('Rol ya existe');
    }
    const newRol = this.rolRepository.create(createRolDto);
    await this.rolRepository.save(newRol);
    return `Rol creado con éxito`;
  }

  async findAllRoles() {
    const roles = await this.rolRepository.find();
 
    return roles;
  }

  async findOneRole(role: string) {
  
      const rol = await this.rolRepository.findOneBy({ nombre_rol: role });
      if (!rol) {
        throw new NotFoundException('Rol no encontrado')
      }
      return rol;
  }

  async login(loginUserDto: LoginUserDto) {
    const { correo, password } = loginUserDto;

    const usuario = await this.userRepository.findOne({ where:{correo}, relations: ['rol']});

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado')
    }
  
    if (!bcrypt.compareSync(password, usuario.password)) {
      throw new UnauthorizedException('Contraseña incorrecta')
    }
  
    delete usuario.password
    return {...usuario, token: this.getJwtToken({id: usuario.id_usuario, rol: usuario.rol})}

  }

  //  >4 Helper to create a token
  private getJwtToken(payload: jwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  findOne(id: number) {
   
    return `This action returns a #${id} auth`;
  }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
