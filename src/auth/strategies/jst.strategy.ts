import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor( 
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
   
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: jwtPayload) {
    const { id, correo} = payload;
    if (!id && !correo) {
        throw new UnauthorizedException('Faltan credenciales válidas');
    }
   

    const usuario = await this.userRepository.findOne({
        where: [
          { id_usuario: id }, // Cambia `id_usuario` según el nombre real de tu campo en la base de datos
          { correo },
        ], relations: ['rol']
      });
    if (!usuario) {
      throw new UnauthorizedException('Token invalido');
    }
    if (!usuario.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }
    return usuario;
  }
}