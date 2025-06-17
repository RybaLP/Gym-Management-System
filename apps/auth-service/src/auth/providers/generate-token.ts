import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthUser } from '../entities/auth-user.entity';

@Injectable()
export class GenerateToken {
    constructor(private readonly jwtService : JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguraion : ConfigType<typeof jwtConfig>
    ){}

    public async signToken<T>(clientId : string, expiresIn : number, payload? : T){
        return await this.jwtService.signAsync({
            sub : clientId,
            ...payload
        }, {
            audience : this.jwtConfiguraion.audience,
            issuer : this.jwtConfiguraion.issuer,
            secret : this.jwtConfiguraion.secret,
            expiresIn
        })
    }

    public async generateToken (authUser : AuthUser) : Promise<string> {

        return await this.signToken<Pick<AuthUser, 'email' | 'role'>>(
            authUser.id,
            this.jwtConfiguraion.accessTokenTtl,
            {email : authUser.email, role : authUser.role}
        );
    }
}