import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength } from "class-validator";


export class CreateUserDto {

    @IsNotEmpty({message: 'El nombre no puede ir vacio'})
    @IsString({message: 'El nombre debe de ser texto'})
    nombre: string;

    entidad?: string;

    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Transform(({ value }) => value.trim())
    password: string;

    @IsString()
    rol: string;

}

export class CreateRolDto {

    @IsNotEmpty({message: 'El Rol no puede ir vacio'})
    @IsString({message: 'El Rol debe de ser texto'})
    nombre_rol: string;

}